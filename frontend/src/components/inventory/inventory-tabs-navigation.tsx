"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowUpDown, ClipboardList, FileText, Calendar } from "lucide-react";
import { InventoryTab } from "./tabs/inventory-tab";
import { InventoryMovementsTab } from "./tabs/inventory-movements-tab";
import { InventoryCountsTab } from "./tabs/inventory-counts-tab";
import { InventoryCountDetailsTab } from "./tabs/inventory-count-details-tab";
import { InventoryReservationsTab } from "./tabs/inventory-reservations-tab";

export function InventoryTabsNavigation() {
  const defaultTab = "inventory";

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="inventory"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="movements"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <ArrowUpDown className="h-4 w-4" />
            Movements
          </TabsTrigger>
          <TabsTrigger
            value="counts"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <ClipboardList className="h-4 w-4" />
            Counts
          </TabsTrigger>
          <TabsTrigger
            value="count-details"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="reservations"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Calendar className="h-4 w-4" />
            Reservations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <InventoryMovementsTab />
        </TabsContent>

        <TabsContent value="counts" className="space-y-4">
          <InventoryCountsTab />
        </TabsContent>

        <TabsContent value="count-details" className="space-y-4">
          <InventoryCountDetailsTab />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <InventoryReservationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}