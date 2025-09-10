'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Locale, locales, localeNames } from '@/lib/i18n';

export function LanguageSwitcher() {
  const intl = useIntl();
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  useEffect(() => {
    setCurrentLocale(intl.locale as Locale);
  }, [intl.locale]);

  const handleLocaleChange = (locale: Locale) => {
    setCurrentLocale(locale);
    // Use the global changeLocale function
    if (typeof window !== 'undefined' && (window as any).changeLocale) {
      (window as any).changeLocale(locale);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeNames[currentLocale]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            <span className="flex items-center gap-2">
              {localeNames[locale]}
              {locale === 'ar' && <span className="text-xs text-muted-foreground">RTL</span>}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}