import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';

import en from '../locales/en.json';
import de from '../locales/de.json';
import ar from '../locales/ar.json';

const messages = {
  en,
  de,
  ar,
};

export type Locale = 'en' | 'de' | 'ar';

export const locales: Locale[] = ['en', 'de', 'ar'];

export const defaultLocale: Locale = 'en';

export function getMessages(locale: Locale) {
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