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
    <div className="w-full h-full">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage inventory, movements, counts and reservations
            </p>
          </div>
        </div>

        <InventoryTabsNavigation />
      </div>
    </div>
  );
}