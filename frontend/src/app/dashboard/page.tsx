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
  Target,
  DollarSign,
  ShoppingCart,
  Truck,
  AlertTriangle,
  CheckCircle,
  Timer,
  Zap,
  Eye,
  Star,
  Shield
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
import { useState, useEffect } from 'react';

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
    lastUpdated: "2 minutes ago",
    gradient: "from-blue-500 via-blue-600 to-purple-600",
    darkGradient: "from-blue-400 via-blue-500 to-purple-500",
    color: "blue",
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.activeUsers', defaultMessage: 'Active Users' }),
    value: "127",
    change: "+5%",
    changeType: "positive",
    icon: Users,
    trend: [110, 115, 120, 118, 125, 127],
    percentage: 76,
    lastUpdated: "5 minutes ago",
    gradient: "from-green-500 via-emerald-600 to-teal-600",
    darkGradient: "from-green-400 via-emerald-500 to-teal-500",
    color: "green",
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.warehouses', defaultMessage: 'Warehouses' }),
    value: "8",
    change: "0%",
    changeType: "neutral",
    icon: Warehouse,
    trend: [8, 8, 8, 8, 8, 8],
    percentage: 100,
    lastUpdated: "1 hour ago",
    gradient: "from-orange-500 via-amber-600 to-red-600",
    darkGradient: "from-orange-400 via-amber-500 to-red-500",
    color: "orange",
  },
  {
    name: intl.formatMessage({ id: 'dashboard.stats.inventoryValue', defaultMessage: 'Inventory Value' }),
    value: "$84,293",
    change: "+18%",
    changeType: "positive",
    icon: BarChart3,
    trend: [65000, 72000, 78000, 81000, 86000, 84293],
    percentage: 92,
    lastUpdated: "10 minutes ago",
    gradient: "from-purple-500 via-violet-600 to-pink-600",
    darkGradient: "from-purple-400 via-violet-500 to-pink-500",
    color: "purple",
  },
];

const getEffectCards = (intl: any) => [
  {
    name: "Today's Orders",
    value: "156",
    change: "+23%",
    changeType: "positive",
    icon: ShoppingCart,
    description: "Orders processed today",
    lastUpdated: "Just now",
    gradient: "from-emerald-500 to-blue-600",
    darkGradient: "from-emerald-400 to-blue-500",
    color: "emerald",
  },
  {
    name: "Revenue Today",
    value: "$12,483",
    change: "+8.2%",
    changeType: "positive",
    icon: DollarSign,
    description: "Today's total revenue",
    lastUpdated: "3 minutes ago",
    gradient: "from-violet-500 to-purple-600",
    darkGradient: "from-violet-400 to-purple-500",
    color: "violet",
  },
  {
    name: "Shipments",
    value: "89",
    change: "+15%",
    changeType: "positive",
    icon: Truck,
    description: "Outbound shipments",
    lastUpdated: "7 minutes ago",
    gradient: "from-cyan-500 to-blue-600",
    darkGradient: "from-cyan-400 to-blue-500",
    color: "cyan",
  },
  {
    name: "Low Stock Items",
    value: "12",
    change: "-3",
    changeType: "negative",
    icon: AlertTriangle,
    description: "Items below threshold",
    lastUpdated: "15 minutes ago",
    gradient: "from-amber-500 to-orange-600",
    darkGradient: "from-amber-400 to-orange-500",
    color: "amber",
  },
  {
    name: "Completion Rate",
    value: "98.5%",
    change: "+2.1%",
    changeType: "positive",
    icon: CheckCircle,
    description: "Order fulfillment rate",
    lastUpdated: "20 minutes ago",
    gradient: "from-green-500 to-emerald-600",
    darkGradient: "from-green-400 to-emerald-500",
    color: "green",
  },
  {
    name: "Avg Processing Time",
    value: "2.3h",
    change: "-0.4h",
    changeType: "positive",
    icon: Timer,
    description: "Average order processing",
    lastUpdated: "12 minutes ago",
    gradient: "from-indigo-500 to-purple-600",
    darkGradient: "from-indigo-400 to-purple-500",
    color: "indigo",
  },
];

export default function DashboardPage() {
  const intl = useIntl();
  const { user } = useAuth();
  const stats = getStats(intl);
  const effectCards = getEffectCards(intl);

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user?.username || 'User';
  };

  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return { date, time };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentDateTime({ date, time });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { date, time } = currentDateTime;

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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {getUserDisplayName()}! 👋
              </h1>
              <p className="text-blue-100 text-base md:text-lg">
                Here's what's happening in your warehouse today
              </p>
            </div>
            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-4 text-blue-100">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm md:text-base font-medium">{date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm md:text-base font-mono font-medium">{time}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards with Modern Design */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1 + index * 0.08,
              ease: "easeOut"
            }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:scale-105 bg-card">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} dark:bg-gradient-to-br dark:${stat.darkGradient} opacity-5 group-hover:opacity-10 dark:opacity-10 dark:group-hover:opacity-15 transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/20 to-background/10" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated {stat.lastUpdated}</span>
                  </div>
                </div>
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} dark:bg-gradient-to-r dark:${stat.darkGradient} rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                  <div className="relative bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-border/50">
                    <stat.icon className="h-5 w-5 text-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-2">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} dark:bg-gradient-to-r dark:${stat.darkGradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        stat.changeType === "positive" ? "default" :
                        stat.changeType === "negative" ? "destructive" : "secondary"
                      }
                      className="text-xs flex items-center space-x-1 shadow-md"
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

      {/* Effect Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Real-time Metrics
          </h2>
          <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {effectCards.map((card, index) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.4 + index * 0.03,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} dark:bg-gradient-to-br dark:${card.darkGradient} opacity-0 group-hover:opacity-15 dark:group-hover:opacity-20 transition-all duration-700`} />

                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${card.gradient} dark:bg-gradient-to-r dark:${card.darkGradient} rounded-lg opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 blur-sm transition-all duration-500`} />

                {/* Animated border */}
                <div className="absolute inset-0 rounded-lg border border-transparent bg-gradient-to-r from-transparent via-background/50 to-transparent group-hover:from-background/30 group-hover:via-background/60 group-hover:to-background/30 transition-all duration-500" />

                <CardContent className="relative p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} dark:bg-gradient-to-r dark:${card.darkGradient} rounded-full blur-md opacity-40 group-hover:opacity-70 transition-all duration-500`} />
                          <div className="relative bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-md group-hover:shadow-lg transition-shadow duration-300 border border-border/50">
                            <card.icon className="h-4 w-4 text-foreground" />
                          </div>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">
                          {card.name}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} dark:bg-gradient-to-r dark:${card.darkGradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                          {card.value}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge
                            variant={card.changeType === "positive" ? "default" : "destructive"}
                            className="text-xs flex items-center space-x-1 shadow-sm"
                          >
                            {card.changeType === "positive" ? (
                              <ArrowUpRight className="h-2 w-2" />
                            ) : (
                              <ArrowDownRight className="h-2 w-2" />
                            )}
                            <span>{card.change}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      <span>{card.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Pulse indicator for real-time data */}
                  <div className="absolute top-2 right-2">
                    <div className={`w-2 h-2 bg-gradient-to-r ${card.gradient} dark:bg-gradient-to-r dark:${card.darkGradient} rounded-full animate-pulse shadow-lg`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-foreground">
                    Revenue Overview
                  </CardTitle>
                  <p className="text-muted-foreground">Monthly revenue and order trends</p>
                </div>
                <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 shadow-md">
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65, ease: "easeOut" }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">
                Warehouse Distribution
              </CardTitle>
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-foreground">
                  Recent Activity
                </CardTitle>
                <Button variant="outline" size="sm" className="hover:shadow-md transition-shadow">
                  <Eye className="h-3 w-3 mr-1" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivityData.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.75, ease: "easeOut" }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">
                Quick Actions
              </CardTitle>
              <p className="text-muted-foreground">Frequently used operations</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="h-12 w-full justify-start text-left group hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-400 dark:to-purple-500 dark:hover:from-blue-500 dark:hover:to-purple-600">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white/20 backdrop-blur-sm p-2 group-hover:bg-white/30 transition-colors">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Add New Product</div>
                        <div className="text-xs text-blue-100">Create and manage inventory</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-12 w-full justify-start text-left group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 hover:bg-green-50 dark:hover:border-green-400 dark:hover:bg-green-950/30">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                        <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Inventory Adjustment</div>
                        <div className="text-xs text-muted-foreground">Update stock levels</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-12 w-full justify-start text-left group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-400 dark:hover:bg-purple-950/30">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Generate Report</div>
                        <div className="text-xs text-muted-foreground">Export analytics data</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-12 w-full justify-start text-left group hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-400 dark:hover:bg-orange-950/30">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 transition-colors">
                        <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">System Settings</div>
                        <div className="text-xs text-muted-foreground">Configure preferences</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}