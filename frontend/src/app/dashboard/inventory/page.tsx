"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { InventoryTabsNavigation } from "@/components/inventory/inventory-tabs-navigation";

export default function InventoryPage() {
  const { user: currentAuthUser, isSuperAdmin, hasRole, isAdmin } = useAuth();

  const canAccessInventoryPage = isSuperAdmin() || isAdmin() || hasRole('manager') || hasRole('warehouse-manager');

  if (!canAccessInventoryPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have permission to access inventory management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-muted-foreground">
          Inventory / Inventory Management
        </h1>
      </div>

      {/* Tab Navigation */}
      <InventoryTabsNavigation />
    </div>
  );
}