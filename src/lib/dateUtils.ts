import { parseISO, isValid } from 'date-fns';

/**
 * Safely parses an ISO date string.
 * Returns a Date object or null if the input is invalid.
 */
export const safeParseISO = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr) {
    console.warn('[DateUtils] Attempted to parse undefined or null date string');
    return null;
  }

  try {
    const parsed = parseISO(dateStr);
    if (isValid(parsed)) {
      return parsed;
    }
    console.error(`[DateUtils] Invalid date string: "${dateStr}"`);
    return null;
  } catch (error) {
    console.error(`[DateUtils] Error parsing date string: "${dateStr}"`, error);
    return null;
  }
};

/**
 * Validates if a string is a valid ISO date.
 */
export const isValidISODate = (dateStr: string | undefined | null): boolean => {
  if (!dateStr) return false;
  const parsed = parseISO(dateStr);
  return isValid(parsed);
};
