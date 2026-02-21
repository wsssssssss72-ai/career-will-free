import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBatchThumbnail = (id: string) => {
  return `https://picsum.photos/seed/${id}/400/225`;
};
