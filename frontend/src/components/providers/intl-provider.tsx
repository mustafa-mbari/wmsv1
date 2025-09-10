'use client';

import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { useEffect, useState } from 'react';
import { getMessages, type Locale, defaultLocale } from '@/lib/i18n';

interface IntlProviderProps {
  children: React.ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState(getMessages(defaultLocale));

  useEffect(() => {
    // Get locale from localStorage or browser
    const savedLocale = localStorage.getItem('locale') as Locale;
    const browserLocale = navigator.language.split('-')[0] as Locale;
    const detectedLocale = savedLocale || (browserLocale in ['en', 'de', 'ar'] ? browserLocale : defaultLocale);
    
    setLocale(detectedLocale);
    setMessages(getMessages(detectedLocale));
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setMessages(getMessages(newLocale));
    localStorage.setItem('locale', newLocale);
    
    // Update document direction for RTL languages
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  // Make changeLocale available globally
  useEffect(() => {
    (window as any).changeLocale = changeLocale;
  }, []);

  return (
    <ReactIntlProvider
      locale={locale}
      messages={messages}
      defaultLocale={defaultLocale}
      onError={(error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('react-intl error:', error);
        }
      }}
    >
      {children}
    </ReactIntlProvider>
  );
}