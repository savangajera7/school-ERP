/**
 * Formats a date string (ISO or YYYY-MM-DD) to user-friendly DD-MM-YYYY
 */
export function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  
  try {
    // If it's a full ISO string from backend
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const parts = datePart.split(/[-/]/);
    
    if (parts.length === 3) {
      const [year, month, day] = parts;
      // Handle case where it might already be DD-MM-YYYY
      if (year.length === 2 && day.length === 4) return datePart;
      
      return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
    }
  } catch (e) {
    // Fallback to original
  }
  
  return dateStr;
}

/**
 * Returns current date in API standard YYYY-MM-DD
 */
export function getTodayApiDate(): string {
  return new Date().toISOString().split("T")[0];
}
