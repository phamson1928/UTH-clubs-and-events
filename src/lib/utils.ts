import { type ClassValue, clsx } from "clsx";
// suppress missing module/type declarations when types are not installed
// @ts-ignore: module 'tailwind-merge' has no type declarations
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
