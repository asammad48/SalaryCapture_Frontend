/**
 * String utility functions for case-insensitive operations
 */
export class StringHelper {

  /**
   * Checks if a source string contains a search string (case-insensitive)
   * @param source - The source string to search within
   * @param search - The string to search for
   * @returns true if source contains search (case-insensitive), false otherwise
   */
  static includesIgnoreCase(source: string | null | undefined, search: string | null | undefined): boolean {
    if (!source || !search) return false;
    return source.toLowerCase().trim().includes(search.toLowerCase().trim());
  }

  /**
   * Checks if two strings are equal (case-insensitive)
   * @param str1 - First string
   * @param str2 - Second string
   * @returns true if strings are equal (case-insensitive), false otherwise
   */
  static equalsIgnoreCase(str1: string | null | undefined, str2: string | null | undefined): boolean {
    if (!str1 || !str2) return false;
    return str1.toLowerCase().trim() === str2.toLowerCase().trim();
  }
}
