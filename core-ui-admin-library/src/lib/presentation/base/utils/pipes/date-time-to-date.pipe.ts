import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon'; // Import Luxon

@Pipe({
  name: 'dateTimeToDate',
  standalone: true,
})
export class DateTimeToDatePipe implements PipeTransform {

    transform(value: string | Date | DateTime, format = 'yyyy-MM-dd'): string {
        if (!value) {
          return '';
        }
    
        let dt: DateTime;
    
        if (typeof value === 'string') {
          dt = DateTime.fromISO(value);
        } else if (value instanceof Date) {
          dt = DateTime.fromJSDate(value);
        } else {
          dt = value;
        }
    
        if (!dt.isValid) {
          return '';
        }
    
        return dt.toFormat(format);
      }
}