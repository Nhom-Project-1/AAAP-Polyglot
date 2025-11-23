import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const validatePassword = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChars = (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length >= 2;

  return hasMinLength && hasUpperCase && hasSpecialChars;
};
