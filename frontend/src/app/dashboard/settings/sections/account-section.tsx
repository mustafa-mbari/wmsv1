'use client';

import React from 'react';
import { useIntl } from 'react-intl';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Edit3,
  ExternalLink
} from 'lucide-react';

export function AccountSection() {
  const intl = useIntl();
  const { user } = useAuth();

  const accountDetails = [
    {
      label: 'Email',
      value: user?.email || 'Not provided',
      icon: Mail,
      verified: true,
    },
    {
      label: 'User ID',
      value: user?.id || 'N/A',
      icon: User,
    },
    {
      label: 'Username',
      value: user?.username || 'N/A',
      icon: User,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Overview */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profilePicture} alt={user?.name} />
            <AvatarFallback className="text-lg">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">
                {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User'}
              </h3>
              {/* Active status not available in current User interface */
              false && (
                <Badge variant="outline" className="text-green-600">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-3">
              {user?.email}
            </p>
            
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Public Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Details */}
      <Card className="p-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Account Information</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountDetails.map((detail, index) => {
              const Icon = detail.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{detail.label}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {detail.value}
                      {detail.verified && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Roles & Permissions */}
      <Card className="p-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Roles & Permissions</Label>
          <p className="text-sm text-muted-foreground">
            Your current roles determine what actions you can perform in the system
          </p>
          
          <div className="space-y-3">
            {user?.role_names?.length ? (
              user.role_names.map((roleName, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">
                        {roleName || 'Unknown Role'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Role permissions
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    Active
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No roles assigned</p>
                <p className="text-sm">Contact your administrator to request roles</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Account Stats */}
      <Card className="p-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Account Activity</Label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">-</div>
              <div className="text-sm text-muted-foreground">Logins</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">-</div>
              <div className="text-sm text-muted-foreground">Actions</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">-</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">-</div>
              <div className="text-sm text-muted-foreground">Data Usage</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Quick Actions</Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start gap-2">
              <User className="h-4 w-4" />
              Update Profile
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Shield className="h-4 w-4" />
              Change Password
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Mail className="h-4 w-4" />
              Email Preferences
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <MapPin className="h-4 w-4" />
              Location Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}