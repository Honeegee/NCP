import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a nurse's name with professional suffix (RN for registered nurses)
 */
export function formatNurseName(
  firstName: string,
  lastName: string,
  professionalStatus?: string | null
): string {
  const name = `${firstName} ${lastName}`.trim();
  if (professionalStatus === "registered_nurse") {
    return `${name}, RN`;
  }
  return name;
}
