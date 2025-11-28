import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class CustomValidators {
    
  static dateRange(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
  
      const formGroup = control as FormGroup;
      const fromDate = formGroup.get('fromDate')?.value;
      const toDate = formGroup.get('toDate')?.value;
    
      if (!fromDate || !toDate) {
        return null;
      }
      
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      if (from > to) {
        return { dateRangeInvalid: true };
      }

      return null;
    };

  }
  
}