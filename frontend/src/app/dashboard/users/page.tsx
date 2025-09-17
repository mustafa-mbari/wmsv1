"use client";

import { useState } from "react";
import { UserTabsNavigation } from "@/components/users/user-tabs-navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function UsersPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case "users":
        return "Users / User Management";
      case "permissions":
        return "Users / Permissions Management";
      case "roles":
        return "Users / Roles Management";
      case "role-permissions":
        return "Users / Role Permissions Management";
      case "user-roles":
        return "Users / User Roles Management";
      default:
        return "Users / User Management";
    }
  };

  // Check if user can access this page
  const canAccessUsersPage = isSuperAdmin() || isAdmin() || hasRole('manager');

  // If user doesn't have access to users page, show access denied
  if (!canAccessUsersPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Users page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only Super Admins, Admins, and Managers can view user information.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-muted-foreground">
          {getPageTitle(activeTab)}
        </h1>
      </div>

      {/* Tab Navigation */}
      <UserTabsNavigation
        defaultTab="users"
        onTabChange={setActiveTab}
      />
    </div>
  );
}