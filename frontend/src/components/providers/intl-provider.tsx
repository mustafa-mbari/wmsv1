'use client';

import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { useEffect, useState, createContext, useContext } from 'react';
import { getMessages, type Locale, defaultLocale, locales } from '@/lib/i18n';

interface IntlContextType {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
}

const IntlContext = createContext<IntlContextType | undefined>(undefined);

export const useLocale = () => {
  const context = useContext(IntlContext);
  if (!context) {
    throw new Error('useLocale must be used within IntlProvider');
  }
  return context;
};

interface IntlProviderProps {
  children: React.ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState(() => getMessages(defaultLocale));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      // Get locale from localStorage or browser
      const savedLocale = localStorage.getItem('locale') as Locale;
      const browserLocale = navigator.language.split('-')[0] as Locale;
      const validBrowserLocale = locales.includes(browserLocale) ? browserLocale : defaultLocale;
      const detectedLocale = savedLocale && locales.includes(savedLocale) ? savedLocale : validBrowserLocale;

      if (detectedLocale !== locale) {
        setLocale(detectedLocale);
        setMessages(getMessages(detectedLocale));
      }

      // Set initial document direction and language
      document.documentElement.dir = detectedLocale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = detectedLocale;

      setIsInitialized(true);
    }
  }, [isInitialized]);

  const changeLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocale(newLocale);
      const newMessages = getMessages(newLocale);
      setMessages(newMessages);

      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);

        // Update document direction for RTL languages
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLocale;
      }
    }
  };

  return (
    <IntlContext.Provider value={{ locale, changeLocale }}>
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
    </IntlContext.Provider>
  );
}