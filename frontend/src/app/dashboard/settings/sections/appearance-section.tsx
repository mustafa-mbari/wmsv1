'use client';

import React from 'react';
import { useIntl } from 'react-intl';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useSettings } from '@/components/providers/settings-provider';
import { useTheme } from '@/components/ui/theme-provider';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';

export function AppearanceSection() {
  const intl = useIntl();
  const { settings, updateSetting } = useSettings();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light' as const,
      labelKey: 'settings.appearance.themeOptions.light',
      icon: Sun,
      description: 'Light theme for daytime use',
    },
    {
      value: 'dark' as const,
      labelKey: 'settings.appearance.themeOptions.dark',
      icon: Moon,
      description: 'Dark theme for low-light environments',
    },
    {
      value: 'system' as const,
      labelKey: 'settings.appearance.themeOptions.system',
      icon: Monitor,
      description: 'Follows your system preference',
    },
  ];

  const accentColorGroups = [
    {
      name: 'Blues',
      colors: [
        { value: 'default' as const, color: 'hsl(221.2, 83.2%, 53.3%)', name: 'Default Blue', labelKey: 'settings.appearance.accentColors.default' },
        { value: 'blue' as const, color: 'hsl(217.2, 91.2%, 59.8%)', name: 'Sky Blue', labelKey: 'settings.appearance.accentColors.blue' },
        { value: 'darkBlue' as const, color: 'hsl(220, 90%, 35%)', name: 'Dark Blue', labelKey: 'settings.appearance.accentColors.darkBlue' },
        { value: 'navyBlue' as const, color: 'hsl(218, 81%, 25%)', name: 'Navy Blue', labelKey: 'settings.appearance.accentColors.navyBlue' },
        { value: 'custom' as const, color: '#283991', name: 'Corporate Blue', labelKey: 'settings.appearance.accentColors.custom' },
        { value: 'teal' as const, color: 'hsl(173, 80%, 40%)', name: 'Teal', labelKey: 'settings.appearance.accentColors.teal' },
      ]
    },
    {
      name: 'Vibrant',
      colors: [
        { value: 'green' as const, color: 'hsl(142.1, 76.2%, 36.3%)', name: 'Emerald', labelKey: 'settings.appearance.accentColors.green' },
        { value: 'purple' as const, color: 'hsl(262.1, 83.3%, 57.8%)', name: 'Purple', labelKey: 'settings.appearance.accentColors.purple' },
        { value: 'red' as const, color: 'hsl(0, 72.2%, 50.6%)', name: 'Ruby Red', labelKey: 'settings.appearance.accentColors.red' },
        { value: 'orange' as const, color: 'hsl(24.6, 95%, 53.1%)', name: 'Orange', labelKey: 'settings.appearance.accentColors.orange' },
        { value: 'pink' as const, color: 'hsl(330.4, 81.2%, 60.4%)', name: 'Pink', labelKey: 'settings.appearance.accentColors.pink' },
      ]
    },
    {
      name: 'Deep Tones',
      colors: [
        { value: 'darkPurple' as const, color: 'hsl(258, 75%, 35%)', name: 'Dark Purple', labelKey: 'settings.appearance.accentColors.darkPurple' },
        { value: 'deepPurple' as const, color: 'hsl(265, 85%, 25%)', name: 'Deep Purple', labelKey: 'settings.appearance.accentColors.deepPurple' },
        { value: 'slate' as const, color: 'hsl(215, 16%, 35%)', name: 'Slate', labelKey: 'settings.appearance.accentColors.slate' },
        { value: 'black' as const, color: 'hsl(0, 0%, 15%)', name: 'Charcoal', labelKey: 'settings.appearance.accentColors.black' },
      ]
    }
  ];

  const fontSizeOptions = [
    { value: 'small' as const, labelKey: 'settings.appearance.fontSizeOptions.small', size: '14px' },
    { value: 'medium' as const, labelKey: 'settings.appearance.fontSizeOptions.medium', size: '16px' },
    { value: 'large' as const, labelKey: 'settings.appearance.fontSizeOptions.large', size: '18px' },
  ];

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            {intl.formatMessage({ id: 'settings.appearance.theme' })}
          </Label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div 
                key={option.value}
                onClick={() => {
                  console.log('Theme div clicked:', option.value);
                  setTheme(option.value);
                  updateSetting('theme', option.value);
                }}
                className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors ${
                  theme === option.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted bg-background'
                }`}
              >
                <Icon className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">
                    {intl.formatMessage({ id: option.labelKey })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">
            {intl.formatMessage({ id: 'settings.appearance.accentColor' })}
          </Label>
          <p className="text-sm text-muted-foreground">
            Choose your preferred accent color for highlights and interactive elements
          </p>
        </div>

        <div className="space-y-6">
          {accentColorGroups.map((group) => (
            <div key={group.name} className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {group.name}
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {group.colors.map((color) => {
                  const isSelected = settings.accentColor === color.value;
                  return (
                    <button
                      key={color.value}
                      onClick={() => updateSetting('accentColor', color.value)}
                      className={`
                        group relative flex flex-col items-center space-y-2 p-3 rounded-xl border-2
                        transition-all duration-200 hover:scale-105 hover:shadow-lg
                        ${isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border bg-card hover:border-primary/30 hover:bg-accent/20'
                        }
                      `}
                      title={color.name}
                    >
                      <div
                        className={`
                          relative w-8 h-8 rounded-full border-2 transition-all
                          ${isSelected
                            ? 'border-background shadow-lg ring-2 ring-primary/20'
                            : 'border-background/20 group-hover:border-background/40'
                          }
                        `}
                        style={{ backgroundColor: color.color }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white drop-shadow-sm" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className={`
                        text-xs font-medium transition-colors text-center leading-tight
                        ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                      `}>
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Preview Section */}
        <Card className="p-4 bg-gradient-to-r from-background to-accent/10 border-2 border-dashed border-primary/20">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
              style={{
                backgroundColor: accentColorGroups
                  .flatMap(group => group.colors)
                  .find(color => color.value === settings.accentColor)?.color || 'hsl(221.2, 83.2%, 53.3%)'
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Color Preview</p>
              <p className="text-xs text-muted-foreground">
                This color will be used for buttons, links, and highlights throughout the interface
              </p>
            </div>
            <Palette className="h-5 w-5 text-primary/60" />
          </div>
        </Card>
      </div>

      {/* Font Size */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            {intl.formatMessage({ id: 'settings.appearance.fontSize' })}
          </Label>
          <p className="text-sm text-muted-foreground">
            Adjust the default text size throughout the interface
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {fontSizeOptions.map((option) => (
            <div 
              key={option.value}
              onClick={() => {
                console.log('Font size div clicked:', option.value);
                updateSetting('fontSize', option.value);
              }}
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors ${
                settings.fontSize === option.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted bg-background'
              }`}
            >
              <div style={{ fontSize: option.size }} className="font-medium mb-2">
                Aa
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">
                  {intl.formatMessage({ id: option.labelKey })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {option.size}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle Settings */}
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  {intl.formatMessage({ id: 'settings.appearance.compactMode' })}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({ id: 'settings.appearance.compactModeDescription' })}
                </p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  {intl.formatMessage({ id: 'settings.appearance.animations' })}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({ id: 'settings.appearance.animationsDescription' })}
                </p>
              </div>
              <Switch
                checked={settings.animations}
                onCheckedChange={(checked) => updateSetting('animations', checked)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}