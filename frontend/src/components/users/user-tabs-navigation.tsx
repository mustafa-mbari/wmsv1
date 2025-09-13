"use client";

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
}

export function UserTabsNavigation({ defaultTab = "users" }: UserTabsNavigationProps) {
  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <UserCheck className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger
            value="role-permissions"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Link className="h-4 w-4" />
            Role Permissions
          </TabsTrigger>
          <TabsTrigger
            value="user-roles"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Settings className="h-4 w-4" />
            User Roles
          </TabsTrigger>
        </TabsList>

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