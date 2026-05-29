/**
 * Validates if the given string is a valid email address.
 */
export const isValidEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Validates if the given string is a valid Indian mobile number.
 */
export const isValidMobile = (value: string): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(value);
};

/**
 * Checks if identifier is either a valid email or mobile number.
 */
export const isValidIdentifier = (value: string): boolean => {
  return isValidEmail(value) || isValidMobile(value);
};

/**
 * Calculates password strength on a 0-3 scale.
 * 0 = very weak, 1 = weak, 2 = medium, 3 = strong
 */
export const getPasswordStrength = (
  password: string
): { score: number; label: string; color: string } => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: "Very Weak", color: "#EF4444" },
    1: { label: "Weak", color: "#F59E0B" },
    2: { label: "Medium", color: "#3B82F6" },
    3: { label: "Strong", color: "#10B981" },
    4: { label: "Strong", color: "#10B981" },
  };

  return { score, ...levels[score] };
};

/**
 * Formats a countdown timer value to MM:SS display.
 */
export const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Deduplicates consecutive repeated words in a display name.
 * e.g., "TESTING TESTING" -> "TESTING"
 */
export const formatDisplayName = (name?: string | null): string => {
  if (!name) return "User";
  const rawName = name.trim();
  return Array.from(new Set(rawName.split(/\s+/))).join(" ");
};
