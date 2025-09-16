"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowUpDown, ClipboardList, FileText, Calendar } from "lucide-react";
import { InventoryTab } from "./tabs/inventory-tab";
import { InventoryMovementsTab } from "./tabs/inventory-movements-tab";
import { InventoryCountsTab } from "./tabs/inventory-counts-tab";
import { InventoryCountDetailsTab } from "./tabs/inventory-count-details-tab";
import { InventoryReservationsTab } from "./tabs/inventory-reservations-tab";

export function InventoryTabsNavigation() {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border/40 bg-background/50 backdrop-blur-sm rounded-lg p-2">
          <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-muted/30">
            <TabsTrigger
              value="inventory"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger
              value="movements"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Movements</span>
            </TabsTrigger>
            <TabsTrigger
              value="counts"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Counts</span>
            </TabsTrigger>
            <TabsTrigger
              value="count-details"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="reservations"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Reservations</span>
            </TabsTrigger>
          </TabsList>
        </div>

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