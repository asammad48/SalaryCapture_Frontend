// export class HelperFunctions {
//     static createApiUrl(apiUrl: string): string {
//       return `${process.env["NX_BASE_DPS_URL"]}/api${apiUrl}`;
//     }

import { HttpResponse } from "@angular/common/http";
import { DateTime, Duration } from "luxon";
import { SALARY_LINE_ACTION_MESSAGES, SALARY_LINE_ACTION_TRANSLATION_KEYS } from "../../core/domain/constants/salary-line-action-messages.constants";

//     static returnEnvUrl(): string {
//       return `${process.env["NX_BASE_DPS_URL"]}/api`;
//     }
//   }

export function formatErrorMessages(errors: string[]): string {
  if (!errors || errors.length === 0) return 'An unknown error has occurred';
  return errors.join(', ');
}

export function handleHttpErrorResponse(err: any): string {

  // Check if error response contains validation errors (ASP.NET Core style)
  if (err?.error?.errors && typeof err.error.errors === 'object') {

    const errorsObj = err.error.errors

    // Flatten all error messages from each field's array
    const allErrors = Object.values(errorsObj)
      .filter(arr => Array.isArray(arr))
      .flat()
      .filter(msg => typeof msg === 'string');

    if (allErrors.length > 0) {
      return allErrors.join(', ');
    }

    return 'Validation failed with unknown error.';
  }

  // Handle plain error messages
  if (typeof err?.message === 'string' && err.message.trim().length > 0) {

    if (err.message.toLowerCase().includes('http failure response')) {
      return 'Server returned an error. Please try again later.';
    }

    return err.message;
  }

  // Handle network errors (e.g. offline, DNS failure)
  if (err instanceof ProgressEvent) {
    return 'Network error: Please check your internet connection.';
  }

  // Catch-all fallback
  return 'An unknown error has occurred. Please try again.';
}

export function toIsoDateOnly(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
}
export function  stripTime(date: Date | null | undefined): Date | null | undefined {
  if(!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDateToDDMMYYYY(date: Date | null | undefined, separator: string = '-'): string | undefined {

  const formattedDate = formatDateParts(date);
  if (!formattedDate) return undefined;

  const { day, month, year } = formattedDate;
  return `${day}${separator}${month}${separator}${year}`;
}

export function formatDateWithTime(date: Date | null | undefined, separator: string = '-'): string | undefined {

  const formattedDate = formatDateParts(date);
  if (!formattedDate) return undefined;

  const { day, month, year, dateObj } = formattedDate;
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  return `${day}${separator}${month}${separator}${year} ${hours}:${minutes}`;
}

function formatDateParts(date: Date | null | undefined): { day: string; month: string; year: number; dateObj: Date } | undefined {

  if (!date) return undefined;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return undefined;
  }

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  return { day, month, year, dateObj };
}

export function formatDateForBackend(date: Date | null | undefined): string | undefined {

  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return undefined;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

export function formatTimeForBackend(time: Date | null | undefined): string | undefined {

  if (!time || !(time instanceof Date) || isNaN(time.getTime())) {
    return undefined;
  }

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const milliseconds = time.getMilliseconds().toString().padStart(3, '0');

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export function formatDateTimeForBackend(date: Date | null | undefined, time: Date | null | undefined): string | undefined {

  const formattedDate = formatDateForBackend(date);
  const formattedTime = formatTimeForBackend(time);

  if (!formattedDate || !formattedTime) {
    return undefined;
  }

  return `${formattedDate}T${formattedTime}`;
}

export function equalsIgnoreCase(str1: string | null | undefined, str2: string | null | undefined): boolean {
  if (!str1 || !str2) return false;
  return str1.toLowerCase() === str2.toLowerCase();
}

export function includesIgnoreCase(source: string | null | undefined, search: string | null | undefined): boolean {
  if (!source || !search) return false;
  return source.toLowerCase().includes(search.toLowerCase());
}

export function searchInArray<T>(array: T[], query: string, keys: (keyof T)[]): T[] {

  if (!Array.isArray(array) || !query || !keys || keys.length === 0) {
    return [];
  }

  const lowerCaseQuery = query.trim().toLowerCase();

  return array.filter(item => keys.some(key => String(item[key]).toLowerCase().includes(lowerCaseQuery)));

}

export function convertStringToDate(dateString: string | undefined): Date | undefined {

    if (!dateString) {
      return undefined;
    }

    const trimmedString = dateString.trim();

    if (!trimmedString) {
      return undefined;
    }

    try {

      const parsedDate = new Date(trimmedString);

      if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid date string provided: ${dateString}`);
        return undefined;
      }

      return parsedDate;

    } catch (error) {
      console.error(`Error parsing date string: ${dateString}`, error);
      return undefined;
    }

  }

  export function calculateMinutesBetweenDates(start: Date | null | undefined, end: Date | null | undefined): number {
    
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime()))
      return 0;

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    // Same-day case (e.g. 06:00 → 07:00)
    if (endMinutes >= startMinutes) {
      return endMinutes - startMinutes;
    }

    // Cross-midnight or full-day case (e.g. 23:00 → 00:00, 06:00 → 00:00)
    if (endMinutes === 0 && startMinutes > 0) {
      return (24 * 60) - startMinutes;
    }

    // Reverse same-day (e.g. 07:00 → 06:00)
    return 0;
  }

export function isTimeBefore(date1: Date | null | undefined, date2: Date | null | undefined): boolean {

  if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime()))
    return false;

  const startMinutes = date1.getHours() * 60 + date1.getMinutes();
  const endMinutes = date2.getHours() * 60 + date2.getMinutes();

  // Case 1: Same-day forward time (normal range)
  if (startMinutes < endMinutes) return true;

  // Case 2: Cross-midnight but ends exactly at 00:00
  if (endMinutes === 0 && startMinutes > 0) return true;

  // Case 3: Anything else (reverse or after midnight)
  return false;
}

  export function isValidDateTimeString(dateTime: unknown): boolean {

    if (typeof dateTime !== 'string' || !dateTime.trim()) {
      return false;
    }

    // special case: .NET MinValue
    if (dateTime === '0001-01-01T00:00:00') {
      return false;
    }

    // try parse
    const parsed = Date.parse(dateTime);

    // must produce a valid timestamp
    if (Number.isNaN(parsed)) {
      return false;
    }

    // extra guard: construct date and verify round-trip to ISO is consistent
    const date = new Date(parsed);

    return date.toString() !== 'Invalid Date';

  }

  export function extractFileNameFromContentDisposition(response: HttpResponse<Blob>): string | null {

    const contentDisposition = response.headers.get('content-disposition');

    if (!contentDisposition) return null;

    const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^;"']+)/i);

    if (!match || !match[1]) return null;

    let fileName = match[1].replace(/['"]/g, '');

    try {
      fileName = decodeURIComponent(fileName);
      
    } catch {
    }

    fileName = fileName.replace(/[^\w.\-]/g, '_');

    return fileName;
  }

    export function getHHMMFromTimeString(timeString: string | null | undefined): string | null {
      if (!timeString) return null;
      const parts = timeString.split(':');
      if (parts.length < 2) return timeString;
      return `${parts[0]}:${parts[1]}`;
    }

    export function getHHMMFromISOString(isoString: string | null | undefined): string | null {
      if (!isoString) return null;
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return null;
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    export function getSalaryLineActionWord(action: number, isSuccess: boolean): string {

      const actionConfig = SALARY_LINE_ACTION_MESSAGES[action];
      
      if (!actionConfig) {
        return isSuccess ? 'completed' : 'process';
      }

      return isSuccess ? actionConfig.successAction : actionConfig.failAction;
    }

    export function getSalaryLineActionTranslationKey(isSuccess: boolean): string {
      return isSuccess ? SALARY_LINE_ACTION_TRANSLATION_KEYS.SUCCESS : SALARY_LINE_ACTION_TRANSLATION_KEYS.FAILED;
    }

    export function getSalaryLineActionStatuses(action: number): { from: string; to: string } {
      const actionConfig = SALARY_LINE_ACTION_MESSAGES[action];
      
      if (!actionConfig) {
        return { from: 'unknown', to: 'unknown' };
      }

      return {
        from: actionConfig.fromStatus,
        to: actionConfig.toStatus
      };
    }

