"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Package, Warehouse } from "lucide-react";

const stats = [
  {
    name: "Total Products",
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: Package,
  },
  {
    name: "Active Users", 
    value: "127",
    change: "+5%",
    changeType: "positive",
    icon: Users,
  },
  {
    name: "Warehouses",
    value: "8",
    change: "0%",
    changeType: "neutral",
    icon: Warehouse,
  },
  {
    name: "Inventory Value",
    value: "$84,293",
    change: "+18%", 
    changeType: "positive",
    icon: BarChart3,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your warehouse management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center pt-1">
                <Badge 
                  variant={
                    stat.changeType === "positive" ? "default" : 
                    stat.changeType === "negative" ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground ml-2">
                  from last month
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New product added: "Wireless Headphones"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Added by John Doe • 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Inventory adjustment: Warehouse A
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Adjusted by Sarah Smith • 4 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New user registered: Mike Johnson
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Registered • 6 hours ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Add New Product
              </button>
              <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Inventory Adjustment
              </button>
              <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Generate Report
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}