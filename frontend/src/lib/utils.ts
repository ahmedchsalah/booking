import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ObjectValues<T> = T[keyof T];
// src/lib/utils.ts
export function withDefaults(props, defaults) {
    return { ...defaults, ...props };
}