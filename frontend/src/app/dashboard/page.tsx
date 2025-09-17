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

// Chart data
const monthlyData = [
  { month: 'Jan', revenue: 65000, orders: 240, products: 2450 },
  { month: 'Feb', revenue: 72000, orders: 280, products: 2580 },
  { month: 'Mar', revenue: 78000, orders: 320, products: 2650 },
  { month: 'Apr', revenue: 81000, orders: 310, products: 2720 },
  { month: 'May', revenue: 86000, orders: 350, products: 2780 },
  { month: 'Jun', revenue: 84000, orders: 330, products: 2847 },
];

const warehouseData = [
  { name: 'Warehouse A', value: 35, color: '#3b82f6' },
  { name: 'Warehouse B', value: 28, color: '#8b5cf6' },
  { name: 'Warehouse C', value: 22, color: '#06d6a0' },
  { name: 'Warehouse D', value: 15, color: '#f59e0b' },
];

const recentActivityData = [
  { time: '2h ago', action: 'Product Added', details: 'Wireless Headphones', type: 'product', user: 'John Doe' },
  { time: '4h ago', action: 'Inventory Adjusted', details: 'Warehouse A - Zone B', type: 'inventory', user: 'Sarah Smith' },
  { time: '6h ago', action: 'User Registered', details: 'Mike Johnson', type: 'user', user: 'System' },
  { time: '8h ago', action: 'Order Fulfilled', details: 'Order #12845', type: 'order', user: 'Alice Brown' },
  { time: '10h ago', action: 'Stock Alert', details: 'Low stock: Gaming Mouse', type: 'alert', user: 'System' },
];

const getStats = (intl: any) => [
  {
    name: intl.formatMessage({ id: 'dashboard.stats.totalProducts', defaultMessage: 'Total Products' }),
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: Package,
    trend: [2450, 2580, 2650, 2720, 2780, 2847],
    percentage: 85,
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.activeUsers', defaultMessage: 'Active Users' }),
    value: "127",
    change: "+5%",
    changeType: "positive",
    icon: Users,
    trend: [110, 115, 120, 118, 125, 127],
    percentage: 76,
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.warehouses', defaultMessage: 'Warehouses' }),
    value: "8",
    change: "0%",
    changeType: "neutral",
    icon: Warehouse,
    trend: [8, 8, 8, 8, 8, 8],
    percentage: 100,
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.inventoryValue', defaultMessage: 'Inventory Value' }),
    value: "$84,293",
    change: "+18%",
    changeType: "positive",
    icon: BarChart3,
    trend: [65000, 72000, 78000, 81000, 86000, 84293],
    percentage: 92,
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product': return Package;
      case 'inventory': return Warehouse;
      case 'user': return Users;
      case 'order': return Target;
      case 'alert': return Activity;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'product': return 'text-blue-500';
      case 'inventory': return 'text-green-500';
      case 'user': return 'text-purple-500';
      case 'order': return 'text-orange-500';
      case 'alert': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {getUserDisplayName()}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening in your warehouse today
              </p>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <Calendar className="h-5 w-5" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards with Modern Design */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                  <stat.icon className="relative h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        stat.changeType === "positive" ? "default" :
                        stat.changeType === "negative" ? "destructive" : "secondary"
                      }
                      className="text-xs flex items-center space-x-1"
                    >
                      {stat.changeType === "positive" && <ArrowUpRight className="h-3 w-3" />}
                      {stat.changeType === "negative" && <ArrowDownRight className="h-3 w-3" />}
                      <span>{stat.change}</span>
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      from last month
                    </p>
                  </div>
                </div>

                {/* Mini Trend Chart */}
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stat.trend.map((value, i) => ({ value, index: i }))}>
                      <defs>
                        <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill={`url(#gradient-${index})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Target Progress</span>
                    <span className="font-medium">{stat.percentage}%</span>
                  </div>
                  <Progress value={stat.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Revenue Overview</CardTitle>
                  <p className="text-muted-foreground">Monthly revenue and order trends</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18.2%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="url(#ordersGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Warehouse Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Warehouse Distribution</CardTitle>
              <p className="text-muted-foreground">Stock allocation across warehouses</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={warehouseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {warehouseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {warehouseData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivityData.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`rounded-full p-2 ${getActivityColor(activity.type)} bg-current/10`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.time}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                        <p className="text-xs text-muted-foreground">by {activity.user}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <p className="text-muted-foreground">Frequently used operations</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Button className="h-12 justify-start text-left group hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-100 p-2 group-hover:bg-blue-200 transition-colors">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Add New Product</div>
                      <div className="text-xs text-muted-foreground">Create and manage inventory</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-12 justify-start text-left group hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-green-100 p-2 group-hover:bg-green-200 transition-colors">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Inventory Adjustment</div>
                      <div className="text-xs text-muted-foreground">Update stock levels</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-12 justify-start text-left group hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-purple-100 p-2 group-hover:bg-purple-200 transition-colors">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Generate Report</div>
                      <div className="text-xs text-muted-foreground">Export analytics data</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-12 justify-start text-left group hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-orange-100 p-2 group-hover:bg-orange-200 transition-colors">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">System Settings</div>
                      <div className="text-xs text-muted-foreground">Configure preferences</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}