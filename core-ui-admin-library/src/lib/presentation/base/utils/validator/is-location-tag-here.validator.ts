import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function isLocationTagHere(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && control.value.length > 0) {
      if (control.value.some((item: any) => item.isLocationTag))
        return null;
    }

    return { locationTagMissing: true };
  };
}
