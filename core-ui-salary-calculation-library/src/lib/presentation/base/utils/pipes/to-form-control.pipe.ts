import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Pipe({
  name: 'toFormControl',
  standalone: true,
})
export class ToFormControlPipe implements PipeTransform {
  transform(value: AbstractControl | null | undefined): FormControl {
    if (value) {
      return value as FormControl;
    }
    throw new Error('Invalid value');
  }
}
