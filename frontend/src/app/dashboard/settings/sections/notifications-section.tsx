'use client';

import React from 'react';
import { useIntl } from 'react-intl';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/components/providers/settings-provider';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  Package, 
  ShoppingCart, 
  Shield, 
  Megaphone,
  Clock
} from 'lucide-react';

export function NotificationsSection() {
  const intl = useIntl();
  const { settings, updateSetting } = useSettings();

  const notificationCategories = [
    {
      key: 'systemAlerts' as const,
      titleKey: 'settings.notifications.systemAlerts',
      descriptionKey: 'settings.notifications.systemAlertsDescription',
      icon: AlertTriangle,
      importance: 'high',
      enabled: settings.systemAlerts,
    },
    {
      key: 'inventoryAlerts' as const,
      titleKey: 'settings.notifications.inventoryAlerts', 
      descriptionKey: 'settings.notifications.inventoryAlertsDescription',
      icon: Package,
      importance: 'high',
      enabled: settings.inventoryAlerts,
    },
    {
      key: 'orderUpdates' as const,
      titleKey: 'settings.notifications.orderUpdates',
      descriptionKey: 'settings.notifications.orderUpdatesDescription',
      icon: ShoppingCart,
      importance: 'medium',
      enabled: settings.orderUpdates,
    },
    {
      key: 'securityAlerts' as const,
      titleKey: 'settings.notifications.securityAlerts',
      descriptionKey: 'settings.notifications.securityAlertsDescription',
      icon: Shield,
      importance: 'high',
      enabled: settings.securityAlerts,
    },
    {
      key: 'marketing' as const,
      titleKey: 'settings.notifications.marketing',
      descriptionKey: 'settings.notifications.marketingDescription',
      icon: Megaphone,
      importance: 'low',
      enabled: settings.marketing,
    },
  ];

  const frequencyOptions = [
    { value: 'immediate' as const, labelKey: 'settings.notifications.frequencyOptions.immediate' },
    { value: 'daily' as const, labelKey: 'settings.notifications.frequencyOptions.daily' },
    { value: 'weekly' as const, labelKey: 'settings.notifications.frequencyOptions.weekly' },
    { value: 'never' as const, labelKey: 'settings.notifications.frequencyOptions.never' },
  ];

  const getImportanceBadge = (importance: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    } as const;

    const labels = {
      high: 'Critical',
      medium: 'Important', 
      low: 'Optional',
    };

    return (
      <Badge variant={variants[importance as keyof typeof variants]} className="text-xs">
        {labels[importance as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Delivery Methods */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Delivery Methods</Label>
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive notifications
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">
                    {intl.formatMessage({ id: 'settings.notifications.emailNotifications' })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">
                    {intl.formatMessage({ id: 'settings.notifications.pushNotifications' })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Browser and mobile push notifications
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Notification Categories</Label>
          <p className="text-sm text-muted-foreground">
            Control which types of notifications you receive
          </p>
        </div>

        <div className="space-y-4">
          {notificationCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.key} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">
                          {intl.formatMessage({ id: category.titleKey })}
                        </div>
                        {getImportanceBadge(category.importance)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {intl.formatMessage({ id: category.descriptionKey })}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={category.enabled}
                    onCheckedChange={(checked) => updateSetting(category.key, checked)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Notification Frequency */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.notifications.frequency' })}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Control how often you receive notification summaries
          </p>
          
          <Select
            value={settings.notificationFrequency}
            onValueChange={(value: 'immediate' | 'daily' | 'weekly' | 'never') => 
              updateSetting('notificationFrequency', value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {intl.formatMessage({ id: option.labelKey })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {settings.notificationFrequency !== 'immediate' && settings.notificationFrequency !== 'never' && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-1">Next summary:</div>
                <div className="text-muted-foreground">
                  {settings.notificationFrequency === 'daily' 
                    ? 'Tomorrow at 9:00 AM' 
                    : 'Next Monday at 9:00 AM'
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Quiet Hours</Label>
            <p className="text-sm text-muted-foreground">
              Temporarily disable non-critical notifications during specific hours
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet-start" className="text-sm font-medium">From</Label>
              <Select defaultValue="22:00">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quiet-end" className="text-sm font-medium">To</Label>
              <Select defaultValue="07:00">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Critical notifications will still be delivered during quiet hours
          </div>
        </div>
      </Card>
    </div>
  );
}