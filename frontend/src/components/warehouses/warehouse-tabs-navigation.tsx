"use client";

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
  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="warehouses"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Warehouse className="h-4 w-4" />
            Warehouses
          </TabsTrigger>
          <TabsTrigger
            value="zones"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <MapPin className="h-4 w-4" />
            Zones
          </TabsTrigger>
          <TabsTrigger
            value="aisles"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Navigation className="h-4 w-4" />
            Aisles
          </TabsTrigger>
          <TabsTrigger
            value="racks"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Archive className="h-4 w-4" />
            Racks
          </TabsTrigger>
          <TabsTrigger
            value="levels"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Layers className="h-4 w-4" />
            Levels
          </TabsTrigger>
          <TabsTrigger
            value="locations"
            className="flex items-center gap-2 data-[state=active]:bg-primary/[0.02] data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-background data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-2 data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 font-medium"
          >
            <Target className="h-4 w-4" />
            Locations
          </TabsTrigger>
        </TabsList>

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