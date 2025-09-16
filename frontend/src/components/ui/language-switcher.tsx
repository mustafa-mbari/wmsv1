'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Locale, locales, localeNames } from '@/lib/i18n';
import { useLocale } from '@/components/providers/intl-provider';
import { useSettings } from '@/components/providers/settings-provider';

export function LanguageSwitcher() {
  const { locale: currentLocale } = useLocale();
  const { settings, updateSetting, saveSettings } = useSettings();

  // Use the language from settings as the source of truth
  const currentLanguage = settings.language as Locale;

  const handleLocaleChange = (locale: Locale) => {
    // Update the settings which will automatically trigger the locale change
    updateSetting('language', locale);

    // Auto-save the settings immediately
    setTimeout(() => {
      saveSettings();
    }, 0);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeNames[currentLanguage]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLanguage === locale ? 'bg-accent' : ''}
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