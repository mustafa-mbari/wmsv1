
"use client";

import React, { useEffect, useState, ReactNode } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  Package, 
  Warehouse,
  Users,
  Settings,
  BarChart3,
  ChevronRight,
  User,
  LogOut,
  Bell,
  Sun,
  Moon,
  Palette
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/ui/theme-provider";
import { useIntl } from "react-intl";

interface DashboardLayoutProps {
  children: ReactNode;
}

const getNavigation = (intl: any) => [
  { name: intl.formatMessage({ id: 'navigation.dashboard' }), href: "/dashboard", icon: Home },
  { name: intl.formatMessage({ id: 'navigation.products' }), href: "/dashboard/products", icon: Package },
  { name: intl.formatMessage({ id: 'navigation.inventory' }), href: "/dashboard/inventory", icon: BarChart3 },
  { name: intl.formatMessage({ id: 'navigation.warehouses' }), href: "/dashboard/warehouses", icon: Warehouse },
  { name: intl.formatMessage({ id: 'navigation.users' }), href: "/dashboard/users", icon: Users },
  { name: intl.formatMessage({ id: 'navigation.uiShowcase' }), href: "/dashboard/ui-showcase", icon: Palette },
  { name: intl.formatMessage({ id: 'navigation.settings' }), href: "/dashboard/settings", icon: Settings },
];

function AppSidebar() {
  const pathname = usePathname();
  const [manuallyOpenMenus, setManuallyOpenMenus] = useState<string[]>([]);
  const { isSuperAdmin, isAdmin, hasRole } = useAuth();
  const intl = useIntl();

  // Filter menu items based on user permissions
  const getFilteredMenuItems = () => {
    const navigation = getNavigation(intl);
    return navigation.filter((item: any) => {
      // Users page - only accessible to Super Admin, Admin, and Manager
      if (item.href === "/users") {
        return isSuperAdmin() || isAdmin() || hasRole('manager');
      }
      // All other pages are accessible to everyone
      return true;
    });
  };

  const filteredMenuItems = getFilteredMenuItems();

  // Calculate which menus should be open based on current location
  const getAutoOpenMenus = () => {
    return [];
  };

  // Combine auto-opened menus with manually opened ones
  const openMenus = Array.from(new Set([...getAutoOpenMenus(), ...manuallyOpenMenus]));

  // Toggle submenu and close others
  const toggleMenu = (menuName: string) => {
    const autoOpenMenus = getAutoOpenMenus();
    
    setManuallyOpenMenus(prev => {
      if (openMenus.includes(menuName)) {
        // If it's an auto-opened menu, don't close it
        if (autoOpenMenus.includes(menuName)) {
          return prev;
        }
        // Otherwise, remove it from manually opened
        return prev.filter(name => name !== menuName);
      } else {
        // Add to manually opened
        return [...prev.filter(name => name !== menuName), menuName];
      }
    });
  };

  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader>
        <div className="flex h-12 items-center gap-2 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground">WM-Lab</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/" && item.href !== "/dashboard" && pathname.startsWith(item.href));
                const isMenuOpen = openMenus.includes(item.name);

                if (item.children) {
                  return (
                    <Collapsible 
                      key={item.name} 
                      open={isMenuOpen} 
                      onOpenChange={() => toggleMenu(item.name)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            isActive={isActive}
                            className={cn(
                              "w-full justify-between rounded-md transition-all duration-300 ease-in-out",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              isActive && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </div>
                            <ChevronRight 
                              className={cn(
                                "h-4 w-4 transition-transform duration-300 ease-in-out",
                                isMenuOpen && "rotate-90"
                              )} 
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="transition-all duration-300 ease-in-out overflow-hidden">
                          <SidebarMenuSub className="ml-4 mt-1 border-l border-sidebar-border/50">
                            {item.children.map((child) => {
                              const childIsActive = pathname === child.href;
                              return (
                                <SidebarMenuSubItem key={child.name}>
                                  <SidebarMenuSubButton 
                                    asChild 
                                    isActive={childIsActive}
                                    className={cn(
                                      "rounded-md transition-all duration-300 ease-in-out",
                                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                      childIsActive && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                                    )}
                                  >
                                    <Link href={child.href}>
                                      <span>{child.name}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={cn(
                        "rounded-md transition-all duration-300 ease-in-out",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground border-t">
          {intl.formatMessage({ id: 'footer.version' })}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const intl = useIntl();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleThemeToggle = () => {
    console.log("Current theme before toggle:", theme);
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log("Switching to theme:", newTheme);
    setTheme(newTheme);
  };

  // Simple theme display - if not mounted, default to light
  const displayTheme = mounted ? theme : "light";

  const getUserDisplayName = (user: any) => {
    if (user?.name) {
      return user.name;
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || 'User';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/30">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
            <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" />
            <div className="h-5 w-px bg-border/60 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <h1 className="text-sm sm:text-lg font-semibold text-foreground/90 hidden sm:block">{intl.formatMessage({ id: 'dashboard.warehouseManagementSystem' })}</h1>
              <h1 className="text-sm font-semibold text-foreground/90 sm:hidden">WM-Lab</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-3 px-3 sm:px-6">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative hover:bg-accent hover:text-accent-foreground transition-colors h-8 w-8 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full text-[10px] sm:text-[11px] text-white flex items-center justify-center font-medium">
                3
              </span>
            </Button>

            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent hover:text-accent-foreground transition-colors h-8 w-8 sm:h-10 sm:w-10"
              onClick={handleThemeToggle}
              title={`Switch to ${displayTheme === "dark" ? "light" : "dark"} mode`}
            >
              {displayTheme === "dark" ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>

            {/* User Menu */}
            <div className="border-l border-border/40 pl-2 sm:pl-3 ml-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors ring-2 ring-transparent hover:ring-border/20">
                    <UserAvatar user={user} size="md" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 sm:w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium leading-none">
                        {getUserDisplayName(user)}
                      </span>
                      <div className="flex gap-1">
                        {(user as any)?.role_names && (user as any)?.role_names.length > 0 ? (
                          (user as any).role_names.map((role: string) => (
                            <Badge 
                              key={role}
                              variant={getRoleBadgeVariant(role.toLowerCase())}
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            No Role
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                  {intl.formatMessage({ id: 'profile.myAccount' })}
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>{intl.formatMessage({ id: 'navigation.profile' })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{intl.formatMessage({ id: 'navigation.settings' })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{intl.formatMessage({ id: 'navigation.logout' })}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6 bg-muted/30">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
