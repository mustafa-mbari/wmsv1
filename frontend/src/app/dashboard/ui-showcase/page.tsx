"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import {
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Search,
  Filter,
  Settings,
  User,
  Bell,
  Heart,
  Star,
  Bookmark,
  Share2,
  MoreVertical,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Activity,
  Target,
  Clock,
  MapPin,
  Calendar,
  FileText,
  Database,
  Zap,
  Award,
  Briefcase,
  PieChart,
  BarChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share,
  Globe,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  CloudDownload,
  CloudUpload,
  HardDrive,
  Cpu,
  MemoryStick,
  Server,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  CreditCard,
  Wallet,
  Receipt,
  ShoppingBag,
  Truck,
  Navigation,
  Compass,
  Camera,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  Volume2,
  VolumeX,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Inbox,
  Archive,
  Folder,
  FolderOpen,
  File,
  Link,
  Maximize2,
  Minimize2,
  RotateCcw,
  RefreshCw,
  Power,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Circle,
  Flame,
  Droplets,
  Sun,
  Moon,
  CloudRain,
  Thermometer,
  Wind,
  Snowflake
} from "lucide-react";
import { useIntl } from "react-intl";

export default function UIShowcasePage() {
  const intl = useIntl();
  const [progress, setProgress] = useState(65);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="UI Design Showcase"
        description="Component library and design patterns for testing and future reference"
      />

      <Tabs defaultValue="buttons" className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full max-w-4xl">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-6">
          <Card id="primary-buttons">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">ID: primary-buttons</span>
                Primary Buttons
              </CardTitle>
              <CardDescription>Main action buttons with different variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button id="btn-primary">Primary</Button>
                <Button variant="secondary" id="btn-secondary">Secondary</Button>
                <Button variant="destructive" id="btn-destructive">Destructive</Button>
                <Button variant="outline" id="btn-outline">Outline</Button>
                <Button variant="ghost" id="btn-ghost">Ghost</Button>
                <Button variant="link" id="btn-link">Link</Button>
              </div>
            </CardContent>
          </Card>

          <Card id="button-sizes">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">ID: button-sizes</span>
                Button Sizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" id="btn-small">Small</Button>
                <Button size="default" id="btn-default">Default</Button>
                <Button size="lg" id="btn-large">Large</Button>
              </div>
            </CardContent>
          </Card>

          <Card id="icon-buttons">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">ID: icon-buttons</span>
                Icon Buttons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button id="btn-play"><Play className="h-4 w-4 mr-2" />Play</Button>
                <Button variant="outline" id="btn-download"><Download className="h-4 w-4 mr-2" />Download</Button>
                <Button variant="secondary" id="btn-upload"><Upload className="h-4 w-4 mr-2" />Upload</Button>
                <Button size="icon" variant="outline" id="btn-settings"><Settings className="h-4 w-4" /></Button>
                <Button size="icon" id="btn-user"><User className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <Card id="loading-buttons">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">ID: loading-buttons</span>
                Loading States
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button disabled id="btn-loading">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </Button>
                <Button variant="outline" disabled id="btn-disabled">Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          <Card id="input-fields">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">ID: input-fields</span>
                Input Fields
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input-text">Text Input</Label>
                  <Input id="input-text" placeholder="Enter text..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-email">Email Input</Label>
                  <Input id="input-email" type="email" placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-password">Password Input</Label>
                  <Input id="input-password" type="password" placeholder="Password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-search">Search Input</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="input-search" placeholder="Search..." className="pl-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="select-components">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">ID: select-components</span>
                Select Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Basic Select</Label>
                  <Select>
                    <SelectTrigger id="select-basic">
                      <SelectValue placeholder="Choose option..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status Select</Label>
                  <Select>
                    <SelectTrigger id="select-status">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Display Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card id="badges-collection">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">ID: badges-collection</span>
                Badges & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge id="badge-default">Default</Badge>
                <Badge variant="secondary" id="badge-secondary">Secondary</Badge>
                <Badge variant="destructive" id="badge-destructive">Error</Badge>
                <Badge variant="outline" id="badge-outline">Outline</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200" id="badge-success">Success</Badge>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200" id="badge-warning">Warning</Badge>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200" id="badge-info">Info</Badge>
              </div>
            </CardContent>
          </Card>

          <Card id="progress-indicators">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">ID: progress-indicators</span>
                Progress Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} id="progress-main" className="w-full" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card id="avatar-showcase">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">ID: avatar-showcase</span>
                Avatars & User Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar id="avatar-image">
                  <AvatarImage src="/api/placeholder/40/40" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar id="avatar-fallback">
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <Avatar id="avatar-large" className="h-12 w-12">
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-6">
          <Card id="stat-cards-basic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: stat-cards-basic</span>
                Basic Stat Cards
              </CardTitle>
              <CardDescription>Simple statistics cards with icons and values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card id="card-total-users" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">2,847</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex items-center pt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">+12%</span>
                      <span className="text-xs text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-revenue" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold">$84,293</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex items-center pt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">+18%</span>
                      <span className="text-xs text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-orders" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Orders</p>
                        <p className="text-2xl font-bold">1,234</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex items-center pt-2">
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-xs text-red-600 font-medium">-5%</span>
                      <span className="text-xs text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-products" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Products</p>
                        <p className="text-2xl font-bold">567</p>
                      </div>
                      <Package className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="flex items-center pt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">+3%</span>
                      <span className="text-xs text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="gradient-stat-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: gradient-stat-cards</span>
                Gradient Stat Cards
              </CardTitle>
              <CardDescription>Eye-catching cards with gradient backgrounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card id="card-gradient-blue" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Active Sessions</p>
                        <p className="text-3xl font-bold text-white">2,847</p>
                      </div>
                      <Activity className="h-12 w-12 text-blue-200" />
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-400 rounded-full opacity-20"></div>
                  </CardContent>
                </Card>

                <Card id="card-gradient-green" className="bg-gradient-to-r from-green-500 to-green-600 text-white overflow-hidden relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Completed Tasks</p>
                        <p className="text-3xl font-bold text-white">1,234</p>
                      </div>
                      <Target className="h-12 w-12 text-green-200" />
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-400 rounded-full opacity-20"></div>
                  </CardContent>
                </Card>

                <Card id="card-gradient-purple" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white overflow-hidden relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Total Projects</p>
                        <p className="text-3xl font-bold text-white">89</p>
                      </div>
                      <Briefcase className="h-12 w-12 text-purple-200" />
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-400 rounded-full opacity-20"></div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="detailed-info-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: detailed-info-cards</span>
                Detailed Information Cards
              </CardTitle>
              <CardDescription>Cards with multiple data points and actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card id="card-user-profile" className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">John Doe</CardTitle>
                          <p className="text-sm text-muted-foreground">Product Manager</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <User className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Department</p>
                        <p className="font-medium">Engineering</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Join Date</p>
                        <p className="font-medium">Jan 15, 2024</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Projects</p>
                        <p className="font-medium">12 Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-project-overview" className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Website Redesign</CardTitle>
                        <p className="text-sm text-muted-foreground">Due in 5 days</p>
                      </div>
                      <Badge variant="outline">High Priority</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <Progress value={75} className="w-full" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Dec 25, 2024</span>
                      </div>
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">AB</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">CD</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">EF</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="action-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: action-cards</span>
                Action Cards
              </CardTitle>
              <CardDescription>Cards with quick actions and buttons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card id="card-quick-create" className="hover:shadow-md transition-shadow border-dashed border-2">
                  <CardContent className="p-6 text-center">
                    <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-2">Create New Project</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start a new project with our templates</p>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>

                <Card id="card-file-upload" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                    <h3 className="font-semibold mb-2">Upload Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to upload</p>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </CardContent>
                </Card>

                <Card id="card-generate-report" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto text-green-600 mb-3" />
                    <h3 className="font-semibold mb-2">Generate Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create detailed analytics report</p>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="chart-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: chart-cards</span>
                Chart & Analytics Cards
              </CardTitle>
              <CardDescription>Cards designed for displaying charts and analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card id="card-analytics-chart">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Revenue Analytics</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Export Data</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-2xl font-bold">$24,567</div>
                      <Badge className="bg-green-100 text-green-800">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +12%
                      </Badge>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      <LineChart className="h-8 w-8 text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Chart placeholder</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-performance-metrics">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">CPU Usage</span>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Memory Usage</span>
                        </div>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Storage</span>
                        </div>
                        <span className="text-sm font-medium">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="notification-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: notification-cards</span>
                Notification & Activity Cards
              </CardTitle>
              <CardDescription>Cards for displaying notifications and recent activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card id="card-recent-activity">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New user registered</p>
                          <p className="text-xs text-muted-foreground">John Smith joined the platform</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Order completed</p>
                          <p className="text-xs text-muted-foreground">Order #1234 has been delivered</p>
                          <p className="text-xs text-muted-foreground">5 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">System update</p>
                          <p className="text-xs text-muted-foreground">Database maintenance completed</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View All Activities
                    </Button>
                  </CardContent>
                </Card>

                <Card id="card-notifications">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">3</Badge>
                      </CardTitle>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">System Alert</p>
                          <p className="text-xs text-blue-700">Server maintenance scheduled</p>
                        </div>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">Info</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Warning</p>
                          <p className="text-xs text-yellow-700">Storage space running low</p>
                        </div>
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300">Warning</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-900">Success</p>
                          <p className="text-xs text-green-700">Backup completed successfully</p>
                        </div>
                        <Badge variant="outline" className="text-green-700 border-green-300">Success</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="system-status-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: system-status-cards</span>
                System Status Cards
              </CardTitle>
              <CardDescription>Server health, connectivity, and system monitoring cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card id="card-server-status" className="border-l-4 border-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <Server className="h-5 w-5 text-green-600" />
                      </div>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Main Server</p>
                      <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-network-status" className="border-l-4 border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-blue-600" />
                        <Signal className="h-4 w-4 text-blue-600" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Strong</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Network</p>
                      <p className="text-xs text-muted-foreground">Speed: 1.2 Gbps</p>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-security-status" className="border-l-4 border-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        <Lock className="h-4 w-4 text-purple-600" />
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Secure</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Security</p>
                      <p className="text-xs text-muted-foreground">SSL Active</p>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-backup-status" className="border-l-4 border-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-orange-600" />
                        <CloudUpload className="h-4 w-4 text-orange-600" />
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Running</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Backup</p>
                      <p className="text-xs text-muted-foreground">Last: 2h ago</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="social-engagement-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: social-engagement-cards</span>
                Social & Engagement Cards
              </CardTitle>
              <CardDescription>Social media metrics and user engagement tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card id="card-likes-engagement" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-6 w-6 text-blue-600" />
                        <span className="font-semibold">Likes</span>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold mb-1">15.2K</div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-600 font-medium">+8.2%</span>
                      <span className="text-xs text-muted-foreground">vs last week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-comments-engagement" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-purple-600" />
                        <span className="font-semibold">Comments</span>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold mb-1">3.8K</div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-600 font-medium">+12.5%</span>
                      <span className="text-xs text-muted-foreground">vs last week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-shares-engagement" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Share className="h-6 w-6 text-green-600" />
                        <span className="font-semibold">Shares</span>
                      </div>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold mb-1">927</div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-600 font-medium">-3.1%</span>
                      <span className="text-xs text-muted-foreground">vs last week</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="ecommerce-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: ecommerce-cards</span>
                E-commerce Cards
              </CardTitle>
              <CardDescription>Shopping, orders, payments, and inventory management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card id="card-order-summary" className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Order #12345</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">3 items</p>
                        <p className="text-xs text-muted-foreground">Total: $299.99</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>Expected delivery</span>
                      </div>
                      <span className="font-medium">Dec 25, 2024</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-payment-method" className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">**** 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/26</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">Verified & Secure</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-inventory-alert" className="hover:shadow-md transition-shadow border-l-4 border-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-red-700">Low Stock Alert</CardTitle>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Package className="h-8 w-8 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Wireless Headphones</p>
                        <p className="text-xs text-muted-foreground">SKU: WH-001</p>
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current Stock:</span>
                        <span className="font-bold text-red-700">3 units</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Minimum Required:</span>
                        <span className="font-medium">25 units</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="weather-environmental-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: weather-environmental-cards</span>
                Weather & Environmental Cards
              </CardTitle>
              <CardDescription>Weather conditions, temperature, and environmental monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card id="card-temperature" className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Temperature</p>
                        <p className="text-3xl font-bold">24°C</p>
                      </div>
                      <Thermometer className="h-8 w-8 text-orange-200" />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-orange-200" />
                      <span className="text-xs text-orange-100">+2° from yesterday</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-humidity" className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Humidity</p>
                        <p className="text-3xl font-bold">68%</p>
                      </div>
                      <Droplets className="h-8 w-8 text-blue-200" />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-blue-100">Normal range</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-wind-speed" className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-100 text-sm">Wind Speed</p>
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-sm text-gray-200">km/h</p>
                      </div>
                      <Wind className="h-8 w-8 text-gray-200" />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-gray-100">Light breeze</span>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-weather-forecast" className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">Today</p>
                        <p className="text-lg font-bold">Sunny</p>
                        <p className="text-sm text-yellow-200">28° / 18°</p>
                      </div>
                      <Sun className="h-8 w-8 text-yellow-200" />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-yellow-100">UV Index: 7</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="media-content-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: media-content-cards</span>
                Media & Content Cards
              </CardTitle>
              <CardDescription>Image galleries, video players, music, and file management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card id="card-image-gallery" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 rounded-t-lg flex items-center justify-center">
                      <Image className="h-12 w-12 text-white" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">Photo Gallery</h3>
                      <p className="text-sm text-muted-foreground mb-3">247 photos uploaded this month</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                          <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                          <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white"></div>
                          <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white">+</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">View All</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-video-player" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-red-400 to-red-600 rounded-t-lg flex items-center justify-center relative">
                      <Video className="h-12 w-12 text-white" />
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        4:32
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">Product Demo Video</h3>
                      <p className="text-sm text-muted-foreground mb-3">How to use our new features</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-music-player" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">Focus Playlist</h3>
                        <p className="text-xs text-muted-foreground">Lo-fi beats to work to</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>2:34</span>
                        <span>4:12</span>
                      </div>
                      <Progress value={62} className="h-1" />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <Button size="sm" variant="ghost">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="communication-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: communication-cards</span>
                Communication Cards
              </CardTitle>
              <CardDescription>Messages, emails, calls, and team collaboration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card id="card-message-thread" className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Team Chat
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800">3 new</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3 max-h-32 overflow-y-auto">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">JS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-100 rounded-lg p-2">
                          <p className="text-xs">Great work on the new feature!</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">AM</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-100 rounded-lg p-2">
                          <p className="text-xs">Thanks! Ready for deployment.</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input placeholder="Type a message..." className="text-sm" />
                      <Button size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-email-inbox" className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Inbox
                      </CardTitle>
                      <Badge variant="destructive">12</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Product Launch Meeting</p>
                          <p className="text-xs text-muted-foreground">Tomorrow at 2 PM...</p>
                        </div>
                        <span className="text-xs text-muted-foreground">2h</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Weekly Report Ready</p>
                          <p className="text-xs text-muted-foreground">Analytics summary attached...</p>
                        </div>
                        <span className="text-xs text-muted-foreground">4h</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">System Maintenance</p>
                          <p className="text-xs text-muted-foreground">Scheduled for this weekend...</p>
                        </div>
                        <span className="text-xs text-muted-foreground">1d</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Inbox className="h-4 w-4 mr-2" />
                      View All Messages
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="productivity-cards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">ID: productivity-cards</span>
                Productivity & Task Cards
              </CardTitle>
              <CardDescription>Task management, calendars, notes, and productivity tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card id="card-task-checklist" className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Daily Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                        <span className="text-sm line-through text-muted-foreground">Review pull requests</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                        <span className="text-sm line-through text-muted-foreground">Update documentation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Square className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Prepare demo presentation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Square className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Team meeting at 3 PM</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">2/4 completed</span>
                      </div>
                      <Progress value={50} className="mt-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-calendar-widget" className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      December 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      <div className="text-center font-medium text-muted-foreground">S</div>
                      <div className="text-center font-medium text-muted-foreground">M</div>
                      <div className="text-center font-medium text-muted-foreground">T</div>
                      <div className="text-center font-medium text-muted-foreground">W</div>
                      <div className="text-center font-medium text-muted-foreground">T</div>
                      <div className="text-center font-medium text-muted-foreground">F</div>
                      <div className="text-center font-medium text-muted-foreground">S</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {Array.from({ length: 31 }, (_, i) => (
                        <div
                          key={i + 1}
                          className={`text-center p-1 rounded ${
                            i + 1 === 15 
                              ? 'bg-blue-500 text-white' 
                              : i + 1 === 22 || i + 1 === 25
                              ? 'bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-muted-foreground">Product Launch (22nd)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">Holiday (25th)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="card-notes-widget" className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Quick Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                        <p className="text-xs font-medium">Meeting Ideas</p>
                        <p className="text-xs text-muted-foreground">Discuss new API endpoints...</p>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded">
                        <p className="text-xs font-medium">Bug Fixes</p>
                        <p className="text-xs text-muted-foreground">Check responsive layout issues...</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-2 rounded">
                        <p className="text-xs font-medium">Feature Request</p>
                        <p className="text-xs text-muted-foreground">Add dark mode toggle...</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card id="alert-messages">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-mono">ID: alert-messages</span>
                Alert Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert id="alert-info">
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This is an informational alert message.
                </AlertDescription>
              </Alert>
              
              <Alert id="alert-success" className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Operation completed successfully!
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive" id="alert-error">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card id="dialog-modals">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-mono">ID: dialog-modals</span>
                Dialog & Modals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button id="dialog-trigger">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent id="dialog-content">
                  <DialogHeader>
                    <DialogTitle>Example Dialog</DialogTitle>
                    <DialogDescription>
                      This is an example dialog for UI testing purposes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Dialog content goes here...</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-6">
          <Card id="dropdown-menus">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-mono">ID: dropdown-menus</span>
                Dropdown Menus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" id="dropdown-trigger">
                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent id="dropdown-content">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" />Open
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" id="more-options">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Heart className="mr-2 h-4 w-4" />Like
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="mr-2 h-4 w-4" />Favorite
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          <Card id="tab-navigation">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-mono">ID: tab-navigation</span>
                Tab Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="tab1" id="example-tabs">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4">
                  <p>Content for Tab 1</p>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4">
                  <p>Content for Tab 2</p>
                </TabsContent>
                <TabsContent value="tab3" className="mt-4">
                  <p>Content for Tab 3</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card id="card-layouts">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">ID: card-layouts</span>
                Card Layouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card id="simple-card">
                  <CardHeader>
                    <CardTitle>Simple Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Basic card content</p>
                  </CardContent>
                </Card>

                <Card id="stat-card" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardHeader>
                    <CardTitle>Stat Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-blue-100">Total Items</p>
                  </CardContent>
                </Card>

                <Card id="action-card">
                  <CardHeader>
                    <CardTitle>Action Card</CardTitle>
                    <CardDescription>With action buttons</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm">Action 1</Button>
                      <Button size="sm" variant="outline">Action 2</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card id="separator-examples">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">ID: separator-examples</span>
                Separators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Section 1</h4>
                <p className="text-sm text-muted-foreground">Content for section 1</p>
              </div>
              <Separator id="horizontal-separator" />
              <div>
                <h4 className="font-medium">Section 2</h4>
                <p className="text-sm text-muted-foreground">Content for section 2</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Component ID Reference */}
      <Card id="component-reference">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">ID: component-reference</span>
            Component ID Reference
          </CardTitle>
          <CardDescription>Use these IDs to reference components in future development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <h5 className="font-semibold text-blue-600">Buttons</h5>
              <div className="font-mono text-gray-600 space-y-0.5">
                <div>#btn-primary</div>
                <div>#btn-secondary</div>
                <div>#btn-destructive</div>
                <div>#btn-outline</div>
                <div>#btn-ghost</div>
                <div>#btn-loading</div>
              </div>
            </div>
            <div className="space-y-1">
              <h5 className="font-semibold text-green-600">Forms</h5>
              <div className="font-mono text-gray-600 space-y-0.5">
                <div>#input-text</div>
                <div>#input-email</div>
                <div>#input-search</div>
                <div>#select-basic</div>
                <div>#select-status</div>
              </div>
            </div>
            <div className="space-y-1">
              <h5 className="font-semibold text-purple-600">Data Display</h5>
              <div className="font-mono text-gray-600 space-y-0.5">
                <div>#badge-success</div>
                <div>#badge-warning</div>
                <div>#progress-main</div>
                <div>#avatar-image</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}