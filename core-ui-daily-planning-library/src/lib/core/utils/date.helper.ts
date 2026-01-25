import { WEEKDAY_NAMES } from "../domain/constants/daily-plan/week-day-names";

export class DateHelper {

    static formatDateDDMMYYYY(date: Date | string | undefined | null, separator: string = '-'): string {

        if (!date) {
            return '';
        }

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return '';
        }

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}${separator}${month}${separator}${year}`;
    }

    static formatDateToString(date: Date | null): string | null {

        if (!date) {
            return null;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00`;
    }

    static toDateOnly (date: Date | null): Date | undefined {

        if (!date) {
            return undefined;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const dateOnlyString = `${year}-${month}-${day}`;
        
        // Create a Date object that will serialize to YYYY-MM-DD format
        const dateOnly = new Date(dateOnlyString);
        
        // Override toJSON to return only the date part
        (dateOnly as any).toJSON = function() {
            return dateOnlyString;
        };
        
        return dateOnly;
    }
    static getDayOfWeekFromDate(date: Date | null | undefined): string | undefined {
      if (!date) return undefined;
      const dayIndex = date.getDay();
      return WEEKDAY_NAMES[dayIndex];
    }

    static getTomorrowDayOfWeek(): number {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayIndex = tomorrow.getDay();
      return dayIndex === 0 ? 7 : dayIndex; 
    }
    
    static getTomorrowDate(): Date {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    }

    static isBeforeTomorrow(date: Date): boolean {
        const input = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const tomorrowBase = DateHelper.getTomorrowDate();
        const tomorrow = new Date(tomorrowBase.getFullYear(), tomorrowBase.getMonth(), tomorrowBase.getDate());
        return input < tomorrow;
    }

}
