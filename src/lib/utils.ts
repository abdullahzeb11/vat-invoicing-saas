import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "SAR", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatNumber(value: number, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function isServerless(): boolean {
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.VERCEL ||
      process.env.AWS_EXECUTION_ENV
  );
}

export function formatDate(value: string | Date, locale = "en-US") {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function round2(n: number) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
