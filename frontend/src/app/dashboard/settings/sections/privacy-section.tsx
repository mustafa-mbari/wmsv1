'use client';

import React from 'react';
import { useIntl } from 'react-intl';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/components/providers/settings-provider';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Clock, 
  Download, 
  Trash2, 
  AlertTriangle,
  History,
  Database,
  BarChart3
} from 'lucide-react';

export function PrivacySection() {
  const intl = useIntl();
  const { settings, updateSetting } = useSettings();

  const visibilityOptions = [
    { 
      value: 'public' as const, 
      labelKey: 'settings.privacy.profileVisibilityOptions.public',
      description: 'Your profile is visible to everyone',
      icon: Eye
    },
    { 
      value: 'private' as const, 
      labelKey: 'settings.privacy.profileVisibilityOptions.private',
      description: 'Your profile is only visible to you',
      icon: EyeOff
    },
    { 
      value: 'team' as const, 
      labelKey: 'settings.privacy.profileVisibilityOptions.team',
      description: 'Your profile is visible to team members only',
      icon: Shield
    },
  ];

  const timeoutOptions = [
    { value: '15min' as const, labelKey: 'settings.privacy.timeoutOptions.15min' },
    { value: '30min' as const, labelKey: 'settings.privacy.timeoutOptions.30min' },
    { value: '1hour' as const, labelKey: 'settings.privacy.timeoutOptions.1hour' },
    { value: '4hours' as const, labelKey: 'settings.privacy.timeoutOptions.4hours' },
    { value: 'never' as const, labelKey: 'settings.privacy.timeoutOptions.never' },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Visibility */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.privacy.profileVisibility' })}
            </Label>
            <p className="text-sm text-muted-foreground">
              Control who can see your profile information
            </p>
          </div>
          
          <div className="space-y-3">
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = settings.profileVisibility === option.value;
              
              return (
                <div
                  key={option.value}
                  className={`
                    relative rounded-lg border p-4 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/20'
                    }
                  `}
                  onClick={() => updateSetting('profileVisibility', option.value)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {intl.formatMessage({ id: option.labelKey })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Data & Analytics */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.privacy.dataSharing' })}
            </Label>
            <p className="text-sm text-muted-foreground">
              Control how your data is used to improve our services
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <Label className="font-medium">
                  {intl.formatMessage({ id: 'settings.privacy.analyticsTracking' })}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {intl.formatMessage({ id: 'settings.privacy.analyticsTrackingDescription' })}
              </p>
            </div>
            <Switch
              checked={settings.analyticsTracking}
              onCheckedChange={(checked) => updateSetting('analyticsTracking', checked)}
            />
          </div>

          {!settings.analyticsTracking && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling analytics may limit our ability to improve the service and provide personalized features.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Session Management */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.privacy.sessionTimeout' })}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {intl.formatMessage({ id: 'settings.privacy.sessionTimeoutDescription' })}
          </p>
          
          <Select
            value={settings.sessionTimeout}
            onValueChange={(value: typeof settings.sessionTimeout) => 
              updateSetting('sessionTimeout', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeoutOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {intl.formatMessage({ id: option.labelKey })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Security Features */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Security Features</Label>
            <p className="text-sm text-muted-foreground">
              Additional security measures for your account
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <Label className="font-medium">
                    {intl.formatMessage({ id: 'settings.privacy.twoFactorAuth' })}
                  </Label>
                  <Badge variant="outline" className="text-xs">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({ id: 'settings.privacy.twoFactorAuthDescription' })}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <Label className="font-medium">
                    {intl.formatMessage({ id: 'settings.privacy.loginHistory' })}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  View all login attempts and active sessions
                </p>
              </div>
              <Button variant="outline" size="sm">
                View History
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Data Management</Label>
            <p className="text-sm text-muted-foreground">
              Manage your personal data and account
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <Label className="font-medium">
                    {intl.formatMessage({ id: 'settings.privacy.downloadData' })}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export all your personal data in a portable format
                </p>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <Label className="font-medium text-red-600">
                    {intl.formatMessage({ id: 'settings.privacy.deleteAccount' })}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          We take your privacy seriously. Learn more about how we collect, use, and protect your data in our{' '}
          <Button variant="link" className="p-0 h-auto font-normal underline">
            Privacy Policy
          </Button>
          {' '}and{' '}
          <Button variant="link" className="p-0 h-auto font-normal underline">
            Terms of Service
          </Button>
          .
        </AlertDescription>
      </Alert>
    </div>
  );
}