'use client';

import React from 'react';
import { useIntl } from 'react-intl';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useSettings } from '@/components/providers/settings-provider';
import { locales, localeNames } from '@/lib/i18n';
import { Globe, Clock, Calendar, DollarSign, MapPin } from 'lucide-react';

export function LanguageSection() {
  const intl = useIntl();
  const { settings, updateSetting } = useSettings();

  const dateFormats = [
    { value: 'MM/DD/YYYY' as const, label: 'MM/DD/YYYY (US)', example: '12/31/2024' },
    { value: 'DD/MM/YYYY' as const, label: 'DD/MM/YYYY (EU)', example: '31/12/2024' },
    { value: 'YYYY-MM-DD' as const, label: 'YYYY-MM-DD (ISO)', example: '2024-12-31' },
  ];

  const timeFormats = [
    { value: '12hour' as const, labelKey: 'settings.language.timeFormatOptions.12hour', example: '2:30 PM' },
    { value: '24hour' as const, labelKey: 'settings.language.timeFormatOptions.24hour', example: '14:30' },
  ];

  // Get common timezones
  const commonTimezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'UTC',
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  return (
    <div className="space-y-8">
      {/* Language Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5" />
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.language.language' })}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {intl.formatMessage({ id: 'settings.language.languageDescription' })}
          </p>
          
          <Select
            value={settings.language}
            onValueChange={(value) => updateSetting('language', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {locales.map((locale) => (
                <SelectItem key={locale} value={locale}>
                  <div className="flex items-center gap-2">
                    <span>{localeNames[locale]}</span>
                    {locale === 'ar' && (
                      <span className="text-xs text-muted-foreground">(RTL)</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Date & Time Formats */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5" />
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.language.dateFormat' })}
            </Label>
          </div>
          
          <Select
            value={settings.dateFormat}
            onValueChange={(value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => 
              updateSetting('dateFormat', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{format.label}</span>
                    <span className="text-muted-foreground ml-4">{format.example}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <Label className="text-base font-medium">
                {intl.formatMessage({ id: 'settings.language.timeFormat' })}
              </Label>
            </div>
            
            <Select
              value={settings.timeFormat}
              onValueChange={(value: '12hour' | '24hour') => updateSetting('timeFormat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{intl.formatMessage({ id: format.labelKey })}</span>
                      <span className="text-muted-foreground ml-4">{format.example}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Timezone */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.language.timezone' })}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {intl.formatMessage({ id: 'settings.language.timezoneDescription' })}
          </p>
          
          <Select
            value={settings.timezone}
            onValueChange={(value) => updateSetting('timezone', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                <div className="flex items-center justify-between w-full">
                  <span>Auto-detect</span>
                  <span className="text-muted-foreground ml-4">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                </div>
              </SelectItem>
              {commonTimezones.map((timezone) => (
                <SelectItem key={timezone} value={timezone}>
                  <div className="flex items-center justify-between w-full">
                    <span>{timezone.replace('_', ' ')}</span>
                    <span className="text-muted-foreground ml-4">
                      {new Date().toLocaleTimeString('en-US', { 
                        timeZone: timezone, 
                        hour12: false 
                      })}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Number Format & Currency */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.language.currency' })}
            </Label>
          </div>
          
          <Select defaultValue="USD">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{currency.symbol}</span>
                    <span>{currency.code}</span>
                    <span className="text-muted-foreground">- {currency.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Preview</h4>
            <div className="space-y-1 text-sm">
              <div>Number: {(1234567.89).toLocaleString()}</div>
              <div>Currency: {(1234567.89).toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              })}</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Time: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}