"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse, MapPin, Navigation, Archive, Layers, Target } from "lucide-react";
import { WarehousesTab } from "./tabs/warehouses-tab";
import { WarehouseZonesTab } from "./tabs/warehouse-zones-tab";
import { WarehouseAislesTab } from "./tabs/warehouse-aisles-tab";
import { WarehouseRacksTab } from "./tabs/warehouse-racks-tab";
import { WarehouseLevelsTab } from "./tabs/warehouse-levels-tab";
import { WarehouseLocationsTab } from "./tabs/warehouse-locations-tab";

interface WarehouseTabsNavigationProps {
  defaultTab?: string;
}

export function WarehouseTabsNavigation({ defaultTab = "warehouses" }: WarehouseTabsNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border/40 bg-background/50 backdrop-blur-sm rounded-lg p-2">
          <TabsList className="grid grid-cols-6 w-full h-auto p-1 bg-muted/30">
            <TabsTrigger
              value="warehouses"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Warehouse className="h-4 w-4" />
              <span className="hidden sm:inline">Warehouses</span>
            </TabsTrigger>
            <TabsTrigger
              value="zones"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Zones</span>
            </TabsTrigger>
            <TabsTrigger
              value="aisles"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Aisles</span>
            </TabsTrigger>
            <TabsTrigger
              value="racks"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Archive className="h-4 w-4" />
              <span className="hidden sm:inline">Racks</span>
            </TabsTrigger>
            <TabsTrigger
              value="levels"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Levels</span>
            </TabsTrigger>
            <TabsTrigger
              value="locations"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="warehouses" className="space-y-4">
          <WarehousesTab />
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <WarehouseZonesTab />
        </TabsContent>

        <TabsContent value="aisles" className="space-y-4">
          <WarehouseAislesTab />
        </TabsContent>

        <TabsContent value="racks" className="space-y-4">
          <WarehouseRacksTab />
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <WarehouseLevelsTab />
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <WarehouseLocationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}