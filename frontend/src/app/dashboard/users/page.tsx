"use client";

import { UserTabsNavigation } from "@/components/users/user-tabs-navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function UsersPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();

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
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              User Management System
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Comprehensive user management with roles, permissions, and access control
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <UserTabsNavigation defaultTab="users" />
    </div>
  );
}