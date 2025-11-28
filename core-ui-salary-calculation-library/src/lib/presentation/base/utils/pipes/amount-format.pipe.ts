import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amountFormat',
  standalone: true,
})
export class AmountFormatPipe implements PipeTransform {
  transform(value: number, locale = 'en-US'): string {
    if (isNaN(value)) {
      return '';
    }

    let formattedValue: string;

    switch (locale) {
      case 'da-DK':
        formattedValue = new Intl.NumberFormat('da-DK', {
          style: 'currency',
          currency: 'DKK'
        }).format(value);
        break;
      case 'en-US':
      default:
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
        break;
    }

    return formattedValue.slice(0, -3);
  }
}
