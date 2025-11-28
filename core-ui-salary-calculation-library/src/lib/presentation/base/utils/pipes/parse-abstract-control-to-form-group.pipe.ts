import { Pipe, PipeTransform } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";

@Pipe({
  name: "parseAbstractControlToFormGroup",
  standalone: true
})
export class ParseAbstractControlToFormGroupPipe implements PipeTransform {
  transform(value: AbstractControl): FormGroup {
    if (value) {
      return value as FormGroup;
    }
    throw new Error("Invalid value");
  }
}
