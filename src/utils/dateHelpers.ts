/**
 * Date formatting utility functions for the D-Youth application
 */

/**
 * Returns the current date and time in UTC format (YYYY-MM-DD HH:MM:SS)
 * @returns {string} Formatted date string
 */
export function getCurrentFormattedDate(): string {
  const now = new Date();
  
  // Get the date components
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getUTCDate()).padStart(2, '0');
  
  // Get the time components
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  // Format to YYYY-MM-DD HH:MM:SS
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a date string into UTC format (YYYY-MM-DD HH:MM:SS)
 * @param {string | Date} date - Date string or Date object to format
 * @returns {string} Formatted date string
 */
export function formatToUTCString(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Get the date components
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  
  // Get the time components
  const hours = String(dateObj.getUTCHours()).padStart(2, '0');
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');
  
  // Format to YYYY-MM-DD HH:MM:SS
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a date string to a localized format based on user's browser settings
 * @param {string} dateString - Date string to format
 * @param {boolean} includeTime - Whether to include the time in the result
 * @returns {string} Localized date string
 */
export function formatLocalDate(dateString: string, includeTime: boolean = true): string {
  try {
    const date = new Date(dateString);
    
    // Options for date formatting
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
    
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return the original string if there's an error
  }
}

/**
 * Calculates the time elapsed since a given date
 * @param {string | Date} date - The date to calculate elapsed time from
 * @returns {string} Human-readable string of elapsed time (e.g., "2 days ago")
 */
export function getTimeElapsed(date: string | Date): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  
  // Calculate the difference in milliseconds
  const diff = now.getTime() - past.getTime();
  
  // Convert to seconds, minutes, hours, days
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Return appropriate string based on the time difference
  if (days > 30) {
    return formatToUTCString(past); // Return the full date for older posts
  } else if (days >= 1) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours >= 1) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes >= 1) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Creates a user-friendly relative time string (e.g., "today", "yesterday", or formatted date)
 * @param {string | Date} date - The date to format
 * @returns {string} User-friendly relative date
 */
export function getUserFriendlyDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  // Check if it's today or yesterday
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateObj.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Otherwise return the formatted date
  return formatLocalDate(dateObj.toString(), false);
}