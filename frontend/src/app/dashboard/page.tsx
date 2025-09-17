"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Users,
  Package,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  FileText,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Target
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useIntl } from "react-intl";
import { useAuth } from "@/components/providers/auth-provider";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const getStats = (intl: any) => [
  {
    name: intl.formatMessage({ id: 'dashboard.stats.totalProducts', defaultMessage: 'Total Products' }),
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: Package,
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.activeUsers', defaultMessage: 'Active Users' }), 
    value: "127",
    change: "+5%",
    changeType: "positive",
    icon: Users,
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.warehouses', defaultMessage: 'Warehouses' }),
    value: "8",
    change: "0%",
    changeType: "neutral",
    icon: Warehouse,
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.inventoryValue', defaultMessage: 'Inventory Value' }),
    value: "$84,293",
    change: "+18%", 
    changeType: "positive",
    icon: BarChart3,
  },
];

export default function DashboardPage() {
  const intl = useIntl();
  const { user } = useAuth();
  const stats = getStats(intl);
  
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user?.username || 'User';
  };
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-lg font-medium text-muted-foreground">
          Dashboard / Overview
        </h1>
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
                  {intl.formatMessage({ id: 'dashboard.fromLastMonth', defaultMessage: 'from last month' })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: 'pages.dashboard.recentActivity' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {intl.formatMessage({ id: 'dashboard.activity.newProduct', defaultMessage: 'New product added: "Wireless Headphones"' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {intl.formatMessage({ id: 'dashboard.activity.addedBy', defaultMessage: 'Added by John Doe • 2 hours ago' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {intl.formatMessage({ id: 'dashboard.activity.inventoryAdjustment', defaultMessage: 'Inventory adjustment: Warehouse A' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {intl.formatMessage({ id: 'dashboard.activity.adjustedBy', defaultMessage: 'Adjusted by Sarah Smith • 4 hours ago' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {intl.formatMessage({ id: 'dashboard.activity.newUser', defaultMessage: 'New user registered: Mike Johnson' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {intl.formatMessage({ id: 'dashboard.activity.registered', defaultMessage: 'Registered • 6 hours ago' })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: 'pages.dashboard.quickActions' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                {intl.formatMessage({ id: 'dashboard.actions.addProduct', defaultMessage: 'Add New Product' })}
              </button>
              <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                {intl.formatMessage({ id: 'dashboard.actions.inventoryAdjustment', defaultMessage: 'Inventory Adjustment' })}
              </button>
              <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                {intl.formatMessage({ id: 'dashboard.actions.generateReport', defaultMessage: 'Generate Report' })}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}