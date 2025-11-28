import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculateRouteRequest } from '../../../../core/domain/models/Salary/salaryline.model';
import { Subject, takeUntil } from 'rxjs';
import { SalaryLineService } from '../../../../data/repositories/salary-line/salary-line.service';
import { SelectModule } from "primeng/select";
import { AutoComplete } from "primeng/autocomplete";
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleTypeOption } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/vehicle-type.model';
import { AccessService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/access.service';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { equalsIgnoreCase, getHHMMFromTimeString, handleHttpErrorResponse } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { GetSalaryLineDto } from 'core-ui-salary-calculation-library/src/lib/core/domain/models';
import { UI_TEMPLATES } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/ui-template.constants';

@Component({
  selector: 'lib-salary-line-address-info',
  imports: [CommonModule, SelectModule, AutoComplete, ReactiveFormsModule],
  templateUrl: './salary-line-address-info.component.html',
  standalone: true,
})

export class SalaryLineAddressInfoComponent implements OnInit {

  private readonly destroyer$ = new Subject<void>();
  private readonly tenantId: string = this.accessService.GetTenantId();

  @Input() addSalaryLineForm!: FormGroup;
  @Input() salaryLine: GetSalaryLineDto | undefined = undefined;
  @Input() isEditMode = false;

  vehicleTypes: VehicleTypeOption[] = [];
  isLoadingVehicleTypes = false;

  startLocation: any;
  endLocation: any;

  startLocationOptions: { label: string; value: any }[] = [];
  endLocationOptions: { label: string; value: any }[] = [];

  routeCalculationError: string | null = null;

  constructor(
    private readonly translateService: TranslateService,
    private readonly salaryLineService: SalaryLineService,
    private readonly accessService: AccessService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.setTimeDistanceValidation();
    this.getVehicleTypes();
    this.populateTimeDistanceValues();
    this.setupUnitFieldCalculation();
    this.setupErrorClearing();
  }

  private setupUnitFieldCalculation(): void {

    const kilometersControl = this.addSalaryLineForm.get('kilometers');

    if (!kilometersControl) return;

    kilometersControl.valueChanges.pipe(takeUntil(this.destroyer$)).subscribe(() => this.calculateKilometers());

  }

  private setupErrorClearing(): void {

    const fieldsToWatch = ['vehicleType'];
    
    fieldsToWatch.forEach(fieldName => {

      const control = this.addSalaryLineForm.get(fieldName);

      if (control) {

        control.valueChanges.pipe(takeUntil(this.destroyer$)).subscribe(() => {
          if (this.routeCalculationError) {
            this.routeCalculationError = null;
          }

        });

      }

    });

  }

  private calculateKilometers(): void {

    const kilometers = this.addSalaryLineForm.get('kilometers')?.value;

    if (!kilometers) return;

    this.addSalaryLineForm.get('quarter')?.setValue(kilometers);
  }

  private populateTimeDistanceValues(): void {

    if(this.isEditMode) {
      this.populateTimeDistanceValuesForEdit();

    } else {
      this.populateTimeDistanceValuesForAdd();
    }

  }

  private populateTimeDistanceValuesForAdd(): void {
    
    const startLocation = this.addSalaryLineForm.get('startLocation')?.value;
    const endLocation = this.addSalaryLineForm.get('endLocation')?.value;

    if(startLocation) {
      this.lookupAddressCoordinates(startLocation, true);
    }

    if(endLocation) {
      this.lookupAddressCoordinates(endLocation, false);
    }
  }

  private setVehicleTypeForEdit(): void {
    
    if(!this.salaryLine) {
      return;
    }

    if(!equalsIgnoreCase(this.salaryLine.uiTemplate, UI_TEMPLATES.TIME_DISTANCE_CONTROL)) {
      this.populateTimeDistanceValuesForAdd();
      return;
    }


    const matchedVehicleType = this.vehicleTypes.find(vt => equalsIgnoreCase(vt.name, this.salaryLine?.vehicleType?.name));
    this.addSalaryLineForm.patchValue({ vehicleType: matchedVehicleType }, {emitEvent: false});
  }

  private setVehicleTypeForAdd(): void {
    const vehicleType = this.addSalaryLineForm.get('vehicleType')?.value;
    if(vehicleType) return;
    const matchedVehicleType = this.vehicleTypes.find(vt => equalsIgnoreCase(vt.name, vehicleType?.name));
    if(matchedVehicleType) {
      this.addSalaryLineForm.patchValue({ vehicleType: matchedVehicleType }, {emitEvent: false});
    }
  }

  getVehicleTypes() {

    this.isLoadingVehicleTypes = true;

    if (!this.tenantId) {
      this.isLoadingVehicleTypes = false;
      return;
    }

    this.salaryLineService.getVehicleTypes(this.tenantId).pipe(takeUntil(this.destroyer$)).subscribe({

      next: (response) => {

        this.vehicleTypes = response?.data || [];
        this.isLoadingVehicleTypes = false;

        if (this.isEditMode) {
          this.setVehicleTypeForEdit();
          
        } else {
          this.setVehicleTypeForAdd();
        }

      },

      error: (error: HttpErrorResponse) => {
        this.vehicleTypes = [];
        this.isLoadingVehicleTypes = false;
        console.error('Error fetching vehicle types:', error);
      }

    });

  }

  private populateTimeDistanceValuesForEdit(): void {
    
    if (!this.salaryLine) {
      return;
    }

    if (this.salaryLine.startLocation) {
      this.lookupAddressCoordinates(this.salaryLine.startLocation, true);
    }

    if (this.salaryLine.endLocation) {
      this.lookupAddressCoordinates(this.salaryLine.endLocation, false);
    }

    if(equalsIgnoreCase(this.salaryLine.uiTemplate, UI_TEMPLATES.TIME_DISTANCE_CONTROL)) {
      this.populateTimeDistanceValuesForAdd();
    }
    
  }

  private lookupAddressCoordinates(address: string, isStart: boolean): void {
    if (!address) return;

    fetch(`https://dawa.aws.dk/adresser/autocomplete?q=${encodeURIComponent(address)}&fuzzy=true`)
      .then(res => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const firstMatch = data[0];
          if (firstMatch && firstMatch.adresse) {
            const selectedAddress = {
              tekst: firstMatch.tekst,
              data: {
                x: firstMatch.adresse.x,
                y: firstMatch.adresse.y
              }
            };

            if (isStart) {
              this.startLocation = selectedAddress;
            } else {
              this.endLocation = selectedAddress;
            }
          }
        }
      })
      .catch(err => {
        console.error('Error looking up address coordinates:', err);
      });
  }

  onSelectAddress(event: any, isStart: boolean): void {

    const selected = event?.value;
    const selectedData = selected?.adresse;

    if (!selected || !selectedData) return;

    const longitude = selectedData.x;
    const latitude = selectedData.y;

    const selectedAddress = {
      tekst: selected.tekst,
      data: {
        x: longitude,
        y: latitude
      }
    };

    if (isStart) {
      this.startLocation = selectedAddress;
      this.addSalaryLineForm.patchValue({ startLocation: selected.tekst });
    } else {
      this.endLocation = selectedAddress;
      this.addSalaryLineForm.patchValue({ endLocation: selected.tekst });
    }
  }

  onSearchAddress(event: any, isStart: boolean) {
    const query = event.query;
    if (!query) {
      if (isStart) this.startLocationOptions = [];
      else this.endLocationOptions = [];
      return;
    }

    fetch(`https://dawa.aws.dk/adresser/autocomplete?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then((data) => {
        if (isStart) this.startLocationOptions = data;
        else this.endLocationOptions = data;
      });
  }


 calculateRoute(): void {
    // Clear any previous error
    this.routeCalculationError = null;
    
    const start = this.startLocation?.data;
    const end = this.endLocation?.data;
    const selectedVehicleType = this.addSalaryLineForm.get('vehicleType')?.value;

    if (start?.x != null && start?.y != null && end?.x != null && end?.y != null && selectedVehicleType) {

      const request: CalculateRouteRequest = {
        startLocationLongitude: start.x,
        startLocationLatitude: start.y,
        endLocationLongitude: end.x,
        endLocationLatitude: end.y,
        vehicleTypeId: selectedVehicleType.id,
        vehicleTypeName: this.addSalaryLineForm.get('vehicleType')?.value?.name
      };

      this.CalculateRouteData(request);

    } else {
      console.warn("Start or End location is invalid or incomplete, or Vehicle Type not selected.");
    }
  }

  CalculateRouteData(request: CalculateRouteRequest): void {

    this.salaryLineService
      .calculateRoute(request)
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response: any) => {

          if (response?.success && response?.data) {
            this.addSalaryLineForm.get('kilometers')?.setValue(Number(response.data.kilometers).toFixed(2));
            const formattedTime = getHHMMFromTimeString(response.data.kmTime);
            this.addSalaryLineForm.get('totalTime')?.setValue(formattedTime);
            this.routeCalculationError = null;

          } else {
            this.routeCalculationError = response?.message || this.translateService.instant('NO_ROUTE_FOUND');
            this.addSalaryLineForm.get('kilometers')?.setValue(null);
            this.addSalaryLineForm.get('totalTime')?.setValue(null);
            this.addSalaryLineForm.get('quarter')?.setValue(null);
          }
        },

        error: (err: HttpErrorResponse) => {
          const errorMessage = handleHttpErrorResponse(err);
          this.routeCalculationError = errorMessage;
        }

      });
  }

  private setTimeDistanceValidation(): void {

    const fields = ['startLocation', 'endLocation', 'kilometers', 'totalTime', 'vehicleType'];

    fields.forEach(field => {
      this.addSalaryLineForm.get(field)?.setValidators([Validators.required]);
    });

  }

  isCalculateRouteDisabled(): boolean {
    const startLocation = this.addSalaryLineForm.get('startLocation')?.value;
    const endLocation = this.addSalaryLineForm.get('endLocation')?.value;
    const vehicleType = this.addSalaryLineForm.get('vehicleType')?.value;

    if (!startLocation || !endLocation || !vehicleType) {
      return true;
    }

    return false;
  }

}
