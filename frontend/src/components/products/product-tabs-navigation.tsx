"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  FolderOpen,
  Award,
  Scale,
  Users,
  Settings,
  Tag,
  List
} from "lucide-react";

// Import individual tab components
import { ProductsTab } from "./tabs/products-tab";
import { CategoriesTab } from "./tabs/categories-tab";
import { BrandsTab } from "./tabs/brands-tab";
import { UnitsTab } from "./tabs/units-tab";
import { FamiliesTab } from "./tabs/families-tab";
import { AttributesTab } from "./tabs/attributes-tab";
import { AttributeOptionsTab } from "./tabs/attribute-options-tab";
import { AttributeValuesTab } from "./tabs/attribute-values-tab";

interface ProductTabsNavigationProps {
  defaultTab?: string;
}

export function ProductTabsNavigation({ defaultTab = "products" }: ProductTabsNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border/40 bg-background/50 backdrop-blur-sm rounded-lg p-2">
          <TabsList className="grid grid-cols-8 w-full h-auto p-1 bg-muted/30">
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger
              value="brands"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Brands</span>
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Units</span>
            </TabsTrigger>
            <TabsTrigger
              value="families"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Families</span>
            </TabsTrigger>
            <TabsTrigger
              value="attributes"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Attributes</span>
            </TabsTrigger>
            <TabsTrigger
              value="attribute-options"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Options</span>
            </TabsTrigger>
            <TabsTrigger
              value="attribute-values"
              className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Values</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value="products" className="space-y-6">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoriesTab />
          </TabsContent>

          <TabsContent value="brands" className="space-y-6">
            <BrandsTab />
          </TabsContent>

          <TabsContent value="units" className="space-y-6">
            <UnitsTab />
          </TabsContent>

          <TabsContent value="families" className="space-y-6">
            <FamiliesTab />
          </TabsContent>

          <TabsContent value="attributes" className="space-y-6">
            <AttributesTab />
          </TabsContent>

          <TabsContent value="attribute-options" className="space-y-6">
            <AttributeOptionsTab />
          </TabsContent>

          <TabsContent value="attribute-values" className="space-y-6">
            <AttributeValuesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}