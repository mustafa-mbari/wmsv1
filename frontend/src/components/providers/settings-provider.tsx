'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useLocale } from './intl-provider';

export interface SettingsState {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  accentColor: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'pink';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animations: boolean;

  // Language & Region
  language: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12hour' | '24hour';
  timezone: string;

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemAlerts: boolean;
  inventoryAlerts: boolean;
  orderUpdates: boolean;
  securityAlerts: boolean;
  marketing: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly' | 'never';

  // Privacy & Security
  profileVisibility: 'public' | 'private' | 'team';
  analyticsTracking: boolean;
  sessionTimeout: '15min' | '30min' | '1hour' | '4hours' | 'never';

  // Advanced
  debugMode: boolean;
  experimentalFeatures: boolean;
}

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
  clearCache: () => void;
  hasUnsavedChanges: boolean;
  saveSettings: () => void;
}

const defaultSettings: SettingsState = {
  // Appearance
  theme: 'system',
  accentColor: 'default',
  fontSize: 'medium',
  compactMode: false,
  animations: true,

  // Language & Region
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12hour',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

  // Notifications
  emailNotifications: true,
  pushNotifications: true,
  systemAlerts: true,
  inventoryAlerts: true,
  orderUpdates: true,
  securityAlerts: true,
  marketing: false,
  notificationFrequency: 'immediate',

  // Privacy & Security
  profileVisibility: 'team',
  analyticsTracking: true,
  sessionTimeout: '4hours',

  // Advanced
  debugMode: false,
  experimentalFeatures: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { setTheme } = useTheme();
  const { changeLocale } = useLocale();

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('wms-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsedSettings });
        } catch (error) {
          console.error('Failed to parse saved settings:', error);
        }
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme, setTheme]);

  // Apply language changes
  useEffect(() => {
    changeLocale(settings.language as any);
  }, [settings.language, changeLocale]);

  // Apply font size
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const fontSizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px',
      };
      root.style.fontSize = fontSizeMap[settings.fontSize];
    }
  }, [settings.fontSize]);

  // Apply compact mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (settings.compactMode) {
        root.classList.add('compact-mode');
      } else {
        root.classList.remove('compact-mode');
      }
    }
  }, [settings.compactMode]);

  // Apply animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (settings.animations) {
        root.classList.remove('no-animations');
      } else {
        root.classList.add('no-animations');
      }
    }
  }, [settings.animations]);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wms-settings', JSON.stringify(settings));
      setHasUnsavedChanges(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wms-settings');
    }
    setHasUnsavedChanges(false);
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      const validatedSettings = { ...defaultSettings, ...importedSettings };
      setSettings(validatedSettings);
      setHasUnsavedChanges(true);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  };

  const clearCache = () => {
    if (typeof window !== 'undefined') {
      // Clear various caches
      localStorage.removeItem('wms-cache');
      sessionStorage.clear();
      
      // Clear service worker caches if available
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    }
  };

  const value: SettingsContextType = {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    clearCache,
    hasUnsavedChanges,
    saveSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}