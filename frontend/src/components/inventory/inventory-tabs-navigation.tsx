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
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-lg">
        <TabsTrigger
          value="inventory"
          className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
        >
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Inventory</span>
        </TabsTrigger>
        <TabsTrigger
          value="movements"
          className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">Movements</span>
        </TabsTrigger>
        <TabsTrigger
          value="counts"
          className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
        >
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Counts</span>
        </TabsTrigger>
        <TabsTrigger
          value="count-details"
          className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Details</span>
        </TabsTrigger>
        <TabsTrigger
          value="reservations"
          className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Reservations</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="inventory">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="movements">
          <InventoryMovementsTab />
        </TabsContent>

        <TabsContent value="counts">
          <InventoryCountsTab />
        </TabsContent>

        <TabsContent value="count-details">
          <InventoryCountDetailsTab />
        </TabsContent>

        <TabsContent value="reservations">
          <InventoryReservationsTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}