import en from '../locales/en.json';
import de from '../locales/de.json';
import ar from '../locales/ar.json';

export type Locale = 'en' | 'de' | 'ar';

export const locales: Locale[] = ['en', 'de', 'ar'];

export const defaultLocale: Locale = 'en';

// Flatten nested messages for react-intl
function flattenMessages(nestedMessages: any, prefix = ''): Record<string, string> {
  let messages: Record<string, string> = {};
  
  for (const key in nestedMessages) {
    const value = nestedMessages[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      messages[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(messages, flattenMessages(value, newKey));
    }
  }
  
  return messages;
}

const messages = {
  en: flattenMessages(en),
  de: flattenMessages(de),
  ar: flattenMessages(ar),
};

export function getMessages(locale: Locale): Record<string, string> {
  return messages[locale] || messages[defaultLocale];
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

export const localeNames = {
  en: 'English',
  de: 'Deutsch',
  ar: 'العربية',
} as const;