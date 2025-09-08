"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRightIcon,
  // Moon,
  // Sun,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  UserX,
  Shield,
} from "lucide-react"
// Simplified stub components for missing dependencies
import React from "react"

export interface UserData {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  is_active: boolean
  email_verified: boolean
  last_login_at?: string
  created_at: string
  role_names: string[]
  role_slugs: string[]
}

interface ColumnFilters {
  name: string
  email: string
  roles: string
  phone: string
  status: string
  lastLogin: string
  created: string
}

type SortDirection = "asc" | "desc" | null
type SortableColumn = "name" | "email" | "roles" | "phone" | "status" | "lastLogin" | "created"

interface SortConfig {
  column: SortableColumn | null
  direction: SortDirection
}

interface GroupConfig {
  column: SortableColumn | null
}

interface ColumnWidths {
  name: number
  email: number
  roles: number
  phone: number
  status: number
  lastLogin: number
  created: number
  actions: number
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 200,
  email: 250,
  roles: 150,
  phone: 150,
  status: 120,
  lastLogin: 150,
  created: 130,
  actions: 120,
}

interface AdvancedUserTableProps {
  data: UserData[]
  loading?: boolean
  onUserSelect?: (userIds: string[]) => void
  onBulkAction?: (action: string, userIds: string[]) => void
  onUserEdit?: (user: UserData) => void
  onUserDelete?: (user: UserData) => void
  onUserView?: (user: UserData) => void
  onUserToggleStatus?: (user: UserData) => void
  onUserManageRoles?: (user: UserData) => void
}

// Simple table settings hook replacement
function useTableSettings() {
  const [settings, setSettings] = useState({
    columnVisibility: {
      name: true,
      email: true,
      roles: true,
      phone: true,
      status: true,
      lastLogin: true,
      created: true,
      actions: true
    },
    sortColumn: null,
    sortDirection: null,
    groupColumn: null,
    pageSize: 25
  });

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const resetSettings = () => {
    setSettings({
      columnVisibility: {
        name: true,
        email: true,
        roles: true,
        phone: true,
        status: true,
        lastLogin: true,
        created: true,
        actions: true
      },
      sortColumn: null,
      sortDirection: null,
      groupColumn: null,
      pageSize: 25
    });
  };
  
  const isLoaded = true;

  return { settings, updateSettings, resetSettings, isLoaded };
}

export function AdvancedUserTable({ 
  data, 
  loading = false, 
  onUserSelect,
  onBulkAction,
  onUserEdit,
  onUserDelete,
  onUserView,
  onUserToggleStatus,
  onUserManageRoles
}: AdvancedUserTableProps) {
  const { settings, updateSettings, resetSettings, isLoaded } = useTableSettings()

  const [filters, setFilters] = useState<ColumnFilters>({
    name: "",
    email: "",
    roles: "all",
    phone: "",
    status: "all",
    lastLogin: "",
    created: "",
  })

  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(DEFAULT_COLUMN_WIDTHS)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)

  const columnVisibility = settings.columnVisibility
  const sortColumn = settings.sortColumn as SortableColumn | null
  const sortDirection = settings.sortDirection
  const groupColumn = settings.groupColumn as SortableColumn | null
  const pageSize = settings.pageSize

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, column: keyof ColumnWidths) => {
      e.preventDefault()
      setIsResizing(column)
      setStartX(e.clientX)
      setStartWidth(columnWidths[column])
    },
    [columnWidths],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const diff = e.clientX - startX
      const newWidth = Math.max(80, startWidth + diff) // Minimum width of 80px

      setColumnWidths((prev) => ({
        ...prev,
        [isResizing]: newWidth,
      }))
    },
    [isResizing, startX, startWidth],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(null)
  }, [])

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const visibleColumns = useMemo(() => {
    return Object.entries(columnVisibility)
      .filter(([_, visible]) => visible)
      .map(([column]) => column as keyof typeof columnVisibility)
  }, [columnVisibility])

  const uniqueValues = useMemo(
    () => ({
      roles: Array.from(new Set(data.flatMap(user => user.role_names))).sort(),
      statuses: ["Active", "Inactive"],
    }),
    [data],
  )

  const filteredData = useMemo(() => {
    return data.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
      const userRoles = user.role_names.join(", ").toLowerCase()
      
      return (
        fullName.includes(filters.name.toLowerCase()) &&
        user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
        (filters.roles === "" || filters.roles === "all" || userRoles.includes(filters.roles.toLowerCase())) &&
        (user.phone || "").toLowerCase().includes(filters.phone.toLowerCase()) &&
        (filters.status === "" || filters.status === "all" || 
         (filters.status === "active" && user.is_active) || 
         (filters.status === "inactive" && !user.is_active)) &&
        (user.last_login_at || "").includes(filters.lastLogin) &&
        user.created_at.includes(filters.created)
      )
    })
  }, [data, filters])

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortColumn) {
        case "name":
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase()
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase()
          break
        case "email":
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case "roles":
          aValue = a.role_names.join(", ").toLowerCase()
          bValue = b.role_names.join(", ").toLowerCase()
          break
        case "phone":
          aValue = (a.phone || "").toLowerCase()
          bValue = (b.phone || "").toLowerCase()
          break
        case "status":
          aValue = a.is_active ? "active" : "inactive"
          bValue = b.is_active ? "active" : "inactive"
          break
        case "lastLogin":
          aValue = a.last_login_at ? new Date(a.last_login_at).getTime() : 0
          bValue = b.last_login_at ? new Date(b.last_login_at).getTime() : 0
          break
        case "created":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (sortColumn === "lastLogin" || sortColumn === "created") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = groupColumn ? sortedData : sortedData.slice(startIndex, endIndex)

  const selectedUsers = useMemo(() => {
    return data.filter((user) => selectedRows.has(user.id))
  }, [data, selectedRows])

  const groupedData = useMemo(() => {
    if (!groupColumn) return null

    const groups = sortedData.reduce(
      (acc, user) => {
        let groupKey = ""
        switch (groupColumn) {
          case "roles":
            groupKey = user.role_names.join(", ") || "No Role"
            break
          case "status":
            groupKey = user.is_active ? "Active" : "Inactive"
            break
          default:
            groupKey = String(user[groupColumn as keyof UserData] || "Unknown")
        }
        
        if (!acc[groupKey]) {
          acc[groupKey] = []
        }
        acc[groupKey].push(user)
        return acc
      },
      {} as Record<string, UserData[]>,
    )

    return Object.entries(groups).map(([groupValue, users]) => ({
      groupValue,
      users,
      count: users.length,
    }))
  }, [sortedData, groupColumn])

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onUserSelect) {
      onUserSelect(Array.from(selectedRows))
    }
  }, [selectedRows, onUserSelect])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = new Set(paginatedData.map((user) => user.id))
      setSelectedRows(currentPageIds)
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (userId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }

  const handleBulkDelete = () => {
    if (onBulkAction) {
      onBulkAction("delete", Array.from(selectedRows))
    }
    setSelectedRows(new Set())
  }

  const handleBulkEmail = () => {
    if (onBulkAction) {
      onBulkAction("email", Array.from(selectedRows))
    }
  }

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((user) => selectedRows.has(user.id))
  const isIndeterminate = paginatedData.some((user) => selectedRows.has(user.id)) && !isAllSelected

  const handleSort = (column: SortableColumn) => {
    let newDirection: SortDirection = "asc"

    if (sortColumn === column) {
      if (sortDirection === "asc") newDirection = "desc"
      else if (sortDirection === "desc") newDirection = null
    }

    updateSettings({
      sortColumn: newDirection ? column : null as any,
      sortDirection: newDirection as any,
    })
    setCurrentPage(1)
  }

  const handleGroup = (column: SortableColumn) => {
    const newGroupColumn = groupColumn === column ? null : column
    updateSettings({ groupColumn: newGroupColumn as any })
    setExpandedGroups(new Set())
    setCurrentPage(1)
  }

  // Removed unused function

  const handlePageSizeChange = (newPageSize: number) => {
    updateSettings({ pageSize: newPageSize })
    setCurrentPage(1)
  }

  const toggleGroupExpansion = (groupValue: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupValue)) {
        newSet.delete(groupValue)
      } else {
        newSet.add(groupValue)
      }
      return newSet
    })
  }

  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4" />
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "destructive"
  }

  const renderColumnHeader = (column: SortableColumn, label: string) => (
    <th
      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground relative border-r border-border/50"
      style={{ width: columnWidths[column], minWidth: columnWidths[column] }}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
          onClick={() => handleSort(column)}
        >
          {label}
          {getSortIcon(column)}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 text-muted-foreground hover:text-foreground"
          onClick={() => handleGroup(column)}
          title={`Group by ${label}`}
        >
          <Users className="h-3 w-3" />
        </Button>
        {groupColumn === column && (
          <Badge variant="secondary" className="text-xs">
            Grouped
          </Badge>
        )}
      </div>
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, column)}
        title="Drag to resize column"
      />
    </th>
  )

  const columnConfig = {
    name: {
      key: "name" as const,
      label: "Name",
      render: (user: UserData) => (
        <div className="font-medium">
          {user.first_name} {user.last_name}
          <div className="text-xs text-muted-foreground">@{user.username}</div>
        </div>
      ),
    },
    email: {
      key: "email" as const,
      label: "Email",
      render: (user: UserData) => (
        <div>
          <span className="text-muted-foreground">{user.email}</span>
          {user.email_verified && (
            <Badge variant="outline" className="ml-2 text-xs">
              Verified
            </Badge>
          )}
        </div>
      ),
    },
    roles: {
      key: "roles" as const,
      label: "Roles",
      render: (user: UserData) => (
        <div className="flex flex-wrap gap-1">
          {user.role_names.length > 0 ? (
            user.role_names.map((role, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {role}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">No roles</span>
          )}
        </div>
      ),
    },
    phone: {
      key: "phone" as const,
      label: "Phone",
      render: (user: UserData) => (
        <span className="text-muted-foreground">{user.phone || "N/A"}</span>
      ),
    },
    status: {
      key: "status" as const,
      label: "Status",
      render: (user: UserData) => (
        <Badge variant={getStatusBadgeVariant(user.is_active)}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    lastLogin: {
      key: "lastLogin" as const,
      label: "Last Login",
      render: (user: UserData) => (
        <span className="text-muted-foreground">
          {user.last_login_at ? formatDate(user.last_login_at) : "Never"}
        </span>
      ),
    },
    created: {
      key: "created" as const,
      label: "Created",
      render: (user: UserData) => (
        <span className="text-muted-foreground">{formatDate(user.created_at)}</span>
      ),
    },
    actions: {
      key: "actions" as const,
      label: "Actions",
      render: (user: UserData) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onUserView?.(user)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUserEdit?.(user)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUserManageRoles?.(user)}
              className="cursor-pointer"
            >
              <Shield className="mr-2 h-4 w-4" />
              Manage Roles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onUserToggleStatus?.(user)}
              className="cursor-pointer"
            >
              <UserX className="mr-2 h-4 w-4" />
              {user.is_active ? "Deactivate" : "Activate"} User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUserDelete?.(user)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  }

  const clearAllFilters = () => {
    setFilters({
      name: "",
      email: "",
      roles: "all",
      phone: "",
      status: "all",
      lastLogin: "",
      created: "",
    })
    updateSettings({ sortColumn: null as any, sortDirection: null as any })
    updateSettings({ groupColumn: null as any })
    setExpandedGroups(new Set())
    setSelectedRows(new Set())
    setCurrentPage(1)
  }

  // Removed unused function

  const hasActiveFilters =
    Object.values(filters).some((filter) => filter !== "" && filter !== "all") ||
    sortColumn !== null ||
    groupColumn !== null

  const MobileUserCard = ({
    user,
    isSelected,
    onSelect,
  }: { user: UserData; isSelected: boolean; onSelect: (checked: boolean) => void }) => (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Checkbox checked={isSelected} onCheckedChange={onSelect} aria-label={`Select ${user.first_name} ${user.last_name}`} />
          <div>
            <div className="font-medium">{user.first_name} {user.last_name}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(user.is_active)}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground">Roles</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {user.role_names.length > 0 ? (
              user.role_names.map((role, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">No roles</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Phone</div>
          <div className="mt-1">{user.phone || "N/A"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Last Login</div>
          <div className="mt-1">{user.last_login_at ? formatDate(user.last_login_at) : "Never"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Created</div>
          <div className="mt-1">{formatDate(user.created_at)}</div>
        </div>
      </div>

      {/* Actions for mobile */}
      <div className="flex justify-end pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onUserView?.(user)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUserEdit?.(user)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUserManageRoles?.(user)}
              className="cursor-pointer"
            >
              <Shield className="mr-2 h-4 w-4" />
              Manage Roles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onUserToggleStatus?.(user)}
              className="cursor-pointer"
            >
              <UserX className="mr-2 h-4 w-4" />
              {user.is_active ? "Deactivate" : "Activate"} User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUserDelete?.(user)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {user.email_verified && (
        <div className="text-sm">
          <Badge variant="outline" className="text-xs">
            Email Verified
          </Badge>
        </div>
      )}
    </div>
  )

  const updateFilter = (column: keyof ColumnFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  if (!isLoaded) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading table settings...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading users...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">User Directory</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Bulk Actions Bar */}
        {selectedRows.size > 0 && (
          <div className="bg-muted/50 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkEmail}>
                  Email Selected
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table ref={tableRef} className="w-full table-fixed">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12 border-r border-border/50">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                      {...(isIndeterminate && { "data-state": "indeterminate" })}
                    />
                  </th>
                  {visibleColumns.map((column) => {
                    const config = columnConfig[column]
                    if (!config) return null
                    
                    if (column === "actions") {
                      return (
                        <th
                          key={column}
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground relative border-r border-border/50"
                          style={{ width: columnWidths[column], minWidth: columnWidths[column] }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{config.label}</span>
                          </div>
                        </th>
                      )
                    }
                    
                    return renderColumnHeader(config.key as SortableColumn, config.label)
                  })}
                </tr>
                {/* Filter Row */}
                <tr className="border-b bg-muted/20">
                  <td className="h-12 px-4 border-r border-border/50"></td>
                  {visibleColumns.map((column) => (
                    <td
                      key={column}
                      className="h-12 px-4 border-r border-border/50"
                      style={{ width: columnWidths[column] }}
                    >
                      {column === "actions" ? (
                        // No filter for actions column
                        <div></div>
                      ) : column === "roles" || column === "status" ? (
                        <Select value={filters[column]} onValueChange={(value) => updateFilter(column, value)}>
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue placeholder={`Filter ${column}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All {column}</SelectItem>
                            {(column === "roles"
                              ? uniqueValues.roles
                              : uniqueValues.statuses
                            ).map((value) => (
                              <SelectItem key={value} value={value.toLowerCase()}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder={`Search ${column}...`}
                            value={filters[column]}
                            onChange={(e) => updateFilter(column, e.target.value)}
                            className="h-8 pl-7"
                          />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedData
                  ? groupedData.map(({ groupValue, users, count }) => (
                      <React.Fragment key={groupValue}>
                        <tr className="border-b bg-muted/10">
                          <td colSpan={visibleColumns.length + 1} className="h-12 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 font-medium"
                              onClick={() => toggleGroupExpansion(groupValue)}
                            >
                              {expandedGroups.has(groupValue) ? (
                                <ChevronDown className="h-4 w-4 mr-2" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 mr-2" />
                              )}
                              {groupValue} ({count} user{count !== 1 ? "s" : ""})
                            </Button>
                          </td>
                        </tr>
                        {expandedGroups.has(groupValue) &&
                          users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="h-12 px-4 border-r border-border/50">
                                <Checkbox
                                  checked={selectedRows.has(user.id)}
                                  onCheckedChange={(checked) => handleSelectRow(user.id, checked as boolean)}
                                  aria-label={`Select ${user.first_name} ${user.last_name}`}
                                />
                              </td>
                              {visibleColumns.map((column) => {
                                const config = columnConfig[column]
                                return config ? (
                                  <td
                                    key={column}
                                    className="h-12 px-4 border-r border-border/50 overflow-hidden"
                                    style={{ width: columnWidths[column] }}
                                  >
                                    <div className="truncate">{config.render(user)}</div>
                                  </td>
                                ) : null
                              })}
                            </tr>
                          ))}
                      </React.Fragment>
                    ))
                  : paginatedData.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="h-12 px-4 border-r border-border/50">
                          <Checkbox
                            checked={selectedRows.has(user.id)}
                            onCheckedChange={(checked) => handleSelectRow(user.id, checked as boolean)}
                            aria-label={`Select ${user.first_name} ${user.last_name}`}
                          />
                        </td>
                        {visibleColumns.map((column) => {
                          const config = columnConfig[column]
                          return config ? (
                            <td
                              key={column}
                              className="h-12 px-4 border-r border-border/50 overflow-hidden"
                              style={{ width: columnWidths[column] }}
                            >
                              <div className="truncate">{config.render(user)}</div>
                            </td>
                          ) : null
                        })}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
          {/* Mobile Filters */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={filters.name}
                  onChange={(e) => updateFilter("name", e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={filters.roles} onValueChange={(value) => updateFilter("roles", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueValues.roles.map((role) => (
                      <SelectItem key={role} value={role.toLowerCase()}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueValues.statuses.map((status) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mobile Select All */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all visible rows"
                {...(isIndeterminate && { "data-state": "indeterminate" })}
              />
              <span className="text-sm font-medium">Select All ({paginatedData.length} users)</span>
            </div>
          </div>

          {/* Mobile User Cards */}
          {groupedData ? (
            <div className="space-y-4">
              {groupedData.map(({ groupValue, users, count }) => (
                <div key={groupValue} className="space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-2 font-medium w-full justify-start"
                    onClick={() => toggleGroupExpansion(groupValue)}
                  >
                    {expandedGroups.has(groupValue) ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 mr-2" />
                    )}
                    {groupValue} ({count} user{count !== 1 ? "s" : ""})
                  </Button>
                  {expandedGroups.has(groupValue) && (
                    <div className="space-y-3 ml-4">
                      {users.map((user) => (
                        <MobileUserCard
                          key={user.id}
                          user={user}
                          isSelected={selectedRows.has(user.id)}
                          onSelect={(checked) => handleSelectRow(user.id, checked)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedData.map((user) => (
                <MobileUserCard
                  key={user.id}
                  user={user}
                  isSelected={selectedRows.has(user.id)}
                  onSelect={(checked) => handleSelectRow(user.id, checked)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!groupColumn && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
