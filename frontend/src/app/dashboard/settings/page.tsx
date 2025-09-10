'use client';

import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/page-header';
import { useSettings } from '@/components/providers/settings-provider';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  User,
  Wrench,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Import section components
import { AppearanceSection } from './sections/appearance-section';
import { LanguageSection } from './sections/language-section';
import { NotificationsSection } from './sections/notifications-section';
import { PrivacySection } from './sections/privacy-section';
import { AccountSection } from './sections/account-section';
import { AdvancedSection } from './sections/advanced-section';

type SettingsSection = 'appearance' | 'language' | 'notifications' | 'privacy' | 'account' | 'advanced';

interface SectionConfig {
  id: SettingsSection;
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
  component: React.ComponentType;
  badge?: string;
}

export default function SettingsPage() {
  const intl = useIntl();
  const { hasUnsavedChanges, saveSettings, resetSettings } = useSettings();
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const sections: SectionConfig[] = [
    {
      id: 'appearance',
      icon: Palette,
      titleKey: 'settings.sections.appearance',
      descriptionKey: 'settings.appearance.description',
      component: AppearanceSection,
    },
    {
      id: 'language',
      icon: Globe,
      titleKey: 'settings.sections.language',
      descriptionKey: 'settings.language.description',
      component: LanguageSection,
    },
    {
      id: 'notifications',
      icon: Bell,
      titleKey: 'settings.sections.notifications',
      descriptionKey: 'settings.notifications.description',
      component: NotificationsSection,
    },
    {
      id: 'privacy',
      icon: Shield,
      titleKey: 'settings.sections.privacy',
      descriptionKey: 'settings.privacy.description',
      component: PrivacySection,
      badge: 'Pro',
    },
    {
      id: 'account',
      icon: User,
      titleKey: 'settings.sections.account',
      descriptionKey: 'profile.description',
      component: AccountSection,
    },
    {
      id: 'advanced',
      icon: Wrench,
      titleKey: 'settings.sections.advanced',
      descriptionKey: 'settings.advanced.description',
      component: AdvancedSection,
      badge: 'Beta',
    },
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      saveSettings();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleReset = () => {
    if (window.confirm(intl.formatMessage({ id: 'settings.messages.confirmReset' }))) {
      resetSettings();
    }
  };

  const currentSection = sections.find(section => section.id === activeSection);
  const CurrentSectionComponent = currentSection?.component || AppearanceSection;

  return (
    <div className="space-y-6">
      <PageHeader
        title={intl.formatMessage({ id: 'settings.title' })}
        description={intl.formatMessage({ id: 'settings.description' })}
      />

      {hasUnsavedChanges && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{intl.formatMessage({ id: 'settings.messages.unsavedChanges' })}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-7 text-xs"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                {intl.formatMessage({ id: 'settings.actions.reset' })}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="h-7 text-xs"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-1 h-3 w-3" />
                    {intl.formatMessage({ id: 'settings.actions.save' })}
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <SettingsIcon className="h-4 w-4" />
                {intl.formatMessage({ id: 'settings.title' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-0 pb-6">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center justify-between px-6 py-3 text-left text-sm transition-colors
                      hover:bg-accent hover:text-accent-foreground
                      ${isActive ? 'bg-accent text-accent-foreground border-r-2 border-primary' : 'text-muted-foreground'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{intl.formatMessage({ id: section.titleKey })}</span>
                    </div>
                    {section.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {currentSection && (
                  <>
                    <currentSection.icon className="h-5 w-5" />
                    <div>
                      <CardTitle>{intl.formatMessage({ id: currentSection.titleKey })}</CardTitle>
                      <CardDescription className="mt-1">
                        {intl.formatMessage({ id: currentSection.descriptionKey })}
                      </CardDescription>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <CurrentSectionComponent />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}