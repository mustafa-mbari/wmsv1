'use client';

import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/components/providers/settings-provider';
import { useAlert } from '@/hooks/useAlert';
import { 
  Bug, 
  Zap, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  Settings2,
  Code,
  Database
} from 'lucide-react';

export function AdvancedSection() {
  const intl = useIntl();
  const { settings, updateSetting, resetSettings, exportSettings, importSettings, clearCache } = useSettings();
  const { showAlert, AlertComponent } = useAlert();
  const [importData, setImportData] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleExport = () => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wms-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importSettings(importData)) {
      setImportData('');
      setShowImport(false);
      showAlert({
        title: "Success",
        description: intl.formatMessage({ id: 'settings.messages.importSuccess' })
      });
    } else {
      showAlert({
        title: "Error",
        description: 'Failed to import settings. Please check the format.'
      });
    }
  };

  const handleResetAll = () => {
    if (window.confirm(intl.formatMessage({ id: 'settings.messages.confirmReset' }))) {
      resetSettings();
      showAlert({
        title: "Success",
        description: intl.formatMessage({ id: 'settings.messages.settingsReset' })
      });
    }
  };

  const handleClearCache = () => {
    clearCache();
    showAlert({
      title: "Success",
      description: intl.formatMessage({ id: 'settings.messages.cacheCleared' })
    });
  };

  return (
    <div className="space-y-8">
      {/* Development Settings */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Development Settings</Label>
            <p className="text-sm text-muted-foreground">
              Options for developers and power users
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  <Label className="font-medium">
                    {intl.formatMessage({ id: 'settings.advanced.debugMode' })}
                  </Label>
                  <Badge variant="outline" className="text-xs">Developer</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({ id: 'settings.advanced.debugModeDescription' })}
                </p>
              </div>
              <Switch
                checked={settings.debugMode}
                onCheckedChange={(checked) => updateSetting('debugMode', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <Label className="font-medium">
                    {intl.formatMessage({ id: 'settings.advanced.experimentalFeatures' })}
                  </Label>
                  <Badge variant="outline" className="text-xs text-orange-600">Beta</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({ id: 'settings.advanced.experimentalFeaturesDescription' })}
                </p>
              </div>
              <Switch
                checked={settings.experimentalFeatures}
                onCheckedChange={(checked) => updateSetting('experimentalFeatures', checked)}
              />
            </div>
          </div>

          {(settings.debugMode || settings.experimentalFeatures) && (
            <Alert className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These settings are intended for advanced users and may affect system stability.
                {settings.experimentalFeatures && ' Some features may not work as expected.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* API Settings */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <Label className="text-base font-medium">
              {intl.formatMessage({ id: 'settings.advanced.apiSettings' })}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure API preferences and behavior
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <Label className="font-medium">API Version</Label>
              <p className="text-sm text-muted-foreground mt-1">v1.2.3</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Label className="font-medium">Rate Limit</Label>
              <p className="text-sm text-muted-foreground mt-1">1000 requests/hour</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Label className="font-medium">Timeout</Label>
              <p className="text-sm text-muted-foreground mt-1">30 seconds</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Label className="font-medium">Retry Attempts</Label>
              <p className="text-sm text-muted-foreground mt-1">3 attempts</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Settings Management */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            <Label className="text-base font-medium">Settings Management</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Import, export, or reset your settings
          </p>
          
          <div className="space-y-4">
            {/* Export Settings */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div className="font-medium">
                  {intl.formatMessage({ id: 'settings.advanced.exportSettings' })}
                </div>
                <p className="text-sm text-muted-foreground">
                  Download your current settings as a JSON file
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'settings.actions.export' })}
              </Button>
            </div>

            {/* Import Settings */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">
                    {intl.formatMessage({ id: 'settings.advanced.importSettings' })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Restore settings from a previously exported JSON file
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowImport(!showImport)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {intl.formatMessage({ id: 'settings.actions.import' })}
                </Button>
              </div>
              
              {showImport && (
                <div className="space-y-3 pt-3 border-t">
                  <Textarea
                    placeholder="Paste your settings JSON here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleImport} disabled={!importData.trim()}>
                      Import
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowImport(false);
                        setImportData('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Reset Settings */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <div>
                <div className="font-medium text-red-800 dark:text-red-300">
                  {intl.formatMessage({ id: 'settings.advanced.resetSettings' })}
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {intl.formatMessage({ id: 'settings.advanced.resetSettingsDescription' })}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetAll}
                className="text-red-600 border-red-300 hover:bg-red-100 hover:text-red-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'settings.actions.reset' })}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* System Maintenance */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <Label className="text-base font-medium">System Maintenance</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Tools to maintain and optimize system performance
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div className="font-medium">
                  {intl.formatMessage({ id: 'settings.advanced.clearCache' })}
                </div>
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({ id: 'settings.advanced.clearCacheDescription' })}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                <Trash2 className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'settings.actions.clear' })}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">System Information</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="font-medium">Version</div>
              <div className="text-muted-foreground">1.0.0</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="font-medium">Build</div>
              <div className="text-muted-foreground">20240910</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="font-medium">Environment</div>
              <div className="text-muted-foreground">Production</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="font-medium">Browser</div>
              <div className="text-muted-foreground">{navigator.userAgent.split(' ')[0]}</div>
            </div>
          </div>
        </div>
      </Card>
      <AlertComponent />
    </div>
  );
}