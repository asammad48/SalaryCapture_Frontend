import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { DateTime } from "luxon";

export function smallerThan(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      const thisValue = DateTime.fromISO(control.value).toISOTime();
      const otherValue = DateTime.fromISO(
        control.parent.get(otherControlName)?.value
      ).toISOTime();
      if (thisValue && otherValue) {
        if (thisValue < otherValue) {
          control.parent.get(otherControlName)?.setErrors(null);
          return null;
        }

        return { smallerthan: true };
      }
    }

    return null;
  };
}

export function greaterThan(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      const thisValue = DateTime.fromISO(control.value).toISOTime();
      const otherValue = DateTime.fromISO(
        control.parent.get(otherControlName)?.value
      ).toISOTime();
      if (thisValue && otherValue) {
        if (thisValue > otherValue) {
          control.parent.get(otherControlName)?.setErrors(null);
          return null;
        }

        return { greaterthan: true };
      }
    }
    return null;
  };
}

export function dateGreater(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      const thisValue = DateTime.fromJSDate(control.value).toISODate();
      const otherValue = DateTime.fromJSDate(
        control.parent.get(otherControlName)?.value
      ).toISODate();
      if (thisValue && otherValue) {
        if (thisValue >= otherValue) {
          control.parent.get(otherControlName)?.setErrors(null);
          return null;
        }

        return { greaterthan: true };
      }
    }
    return null;
  };
}

export function dateSmaller(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      const thisValue = DateTime.fromJSDate(control.value).toISODate();
      const otherValue = DateTime.fromJSDate(
        control.parent.get(otherControlName)?.value
      ).toISODate();
      if (thisValue && otherValue) {
        if (thisValue <= otherValue) {
          control.parent.get(otherControlName)?.setErrors(null);
          return null;
        }

        return { smallerthan: true };
      }
    }
    return null;
  };
}
