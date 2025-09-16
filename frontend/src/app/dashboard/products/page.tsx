"use client";

import { ProductTabsNavigation } from "@/components/products/product-tabs-navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function ProductsPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();

  // Check if user can access this page
  const canAccessProductsPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('inventory-manager');

  // If user doesn't have access to products page, show access denied
  if (!canAccessProductsPage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Products page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Only authorized personnel can view product information.
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
          Products / Product Management
          {!isSuperAdmin() && !isAdmin() && !hasRole('manager') && (
            <span className="ml-2 text-sm">(Read Only)</span>
          )}
        </h1>
      </div>

      {/* Tab Navigation */}
      <ProductTabsNavigation defaultTab="products" />
    </div>
  );
}