"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, UserCheck, Link, Settings } from "lucide-react";
import { UsersTab } from "./tabs/users-tab";
import { PermissionsTab } from "./tabs/permissions-tab";
import { RolesTab } from "./tabs/roles-tab";
import { RolePermissionsTab } from "./tabs/role-permissions-tab";
import { UserRolesTab } from "./tabs/user-roles-tab";

interface UserTabsNavigationProps {
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
}

export function UserTabsNavigation({ defaultTab = "users", onTabChange }: UserTabsNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b border-border/40 bg-background/50 backdrop-blur-sm rounded-lg p-2">
          <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-muted/30">
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger
              value="role-permissions"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Role Permissions</span>
            </TabsTrigger>
            <TabsTrigger
              value="user-roles"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">User Roles</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="space-y-4">
          <UsersTab />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionsTab />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RolesTab />
        </TabsContent>

        <TabsContent value="role-permissions" className="space-y-4">
          <RolePermissionsTab />
        </TabsContent>

        <TabsContent value="user-roles" className="space-y-4">
          <UserRolesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}