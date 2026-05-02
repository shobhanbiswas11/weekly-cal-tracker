// Validation utilities

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDateFormat = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

/**
 * Validate ISO week format (YYYY-Www)
 */
export const isValidWeekFormat = (week: string): boolean => {
  return /^\d{4}-W\d{2}$/.test(week);
};
