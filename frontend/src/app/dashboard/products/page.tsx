"use client";

import { ProductTabsNavigation } from "@/components/products/product-tabs-navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useIntl } from "react-intl";

export default function ProductsPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  const intl = useIntl();

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
            <CardTitle className="mt-4 text-xl">
              {intl.formatMessage({ id: 'products.accessDenied.title' })}
            </CardTitle>
            <CardDescription className="mt-2">
              {intl.formatMessage({ id: 'products.accessDenied.description' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              {intl.formatMessage({ id: 'products.accessDenied.message' })}
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              {intl.formatMessage({ id: 'products.accessDenied.goBack' })}
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
          {intl.formatMessage({ id: 'products.title' })} / {intl.formatMessage({ id: 'products.management' })}
          {!isSuperAdmin() && !isAdmin() && !hasRole('manager') && (
            <span className="ml-2 text-sm">({intl.formatMessage({ id: 'products.readOnly' })})</span>
          )}
        </h1>
      </div>

      {/* Tab Navigation */}
      <ProductTabsNavigation defaultTab="products" />
    </div>
  );
}