export type Locale = (typeof locales)[number];

export const locales = ["ru", "kz"] as const;
export const defaultLocale: Locale = "ru";
