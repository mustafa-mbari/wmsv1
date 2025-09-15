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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TableSettings, ColumnVisibility } from "@/components/ui/table-settings"
import {
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRightIcon,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Copy,
  Download,
} from "lucide-react"
import React from "react"

export interface TableData {
  id: string
  [key: string]: any
}

export interface ColumnConfig<T = TableData> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  filterType?: "text" | "select"
  render?: (item: T) => React.ReactNode
  width?: number
  minWidth?: number
}

interface ColumnFilters {
  [key: string]: string
}

type SortDirection = "asc" | "desc" | null

interface SortConfig {
  column: string | null
  direction: SortDirection
}

interface GroupConfig {
  column: string | null
}

interface ColumnWidths {
  [key: string]: number
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface AdvancedTableProps<T extends TableData = TableData> {
  data: T[]
  columns: ColumnConfig<T>[]
  loading?: boolean
  title?: string
  onRowSelect?: (itemIds: string[]) => void
  onBulkAction?: (action: string, itemIds: string[]) => void
  onRowEdit?: (item: T) => void
  onRowDelete?: (item: T) => void
  onRowView?: (item: T) => void
  onRowToggleStatus?: (item: T) => void
  actions?: {
    view?: { label: string; icon?: React.ReactNode }
    edit?: { label: string; icon?: React.ReactNode }
    delete?: { label: string; icon?: React.ReactNode }
    custom?: Array<{
      label: string
      icon?: React.ReactNode
      onClick: (item: T) => void
      variant?: "default" | "destructive"
    }>
  }
  bulkActions?: Array<{
    label: string
    action: string
    icon?: React.ReactNode
    variant?: "default" | "destructive"
  }>
  emptyMessage?: string
  refreshButton?: React.ReactNode
  addButton?: React.ReactNode
}

function useTableSettings(columns: ColumnConfig[]) {
  const defaultVisibility = columns.reduce((acc, col) => {
    acc[col.key] = true
    return acc
  }, {} as Record<string, boolean>)

  const [settings, setSettings] = useState({
    columnVisibility: defaultVisibility,
    sortColumn: null,
    sortDirection: null,
    groupColumn: null,
    pageSize: 25
  })

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }))
  }

  const resetSettings = () => {
    setSettings({
      columnVisibility: defaultVisibility,
      sortColumn: null,
      sortDirection: null,
      groupColumn: null,
      pageSize: 25
    })
  }

  return { settings, updateSettings, resetSettings, isLoaded: true }
}

export function AdvancedTable<T extends TableData = TableData>({
  data,
  columns,
  loading = false,
  title = "Data Table",
  onRowSelect,
  onBulkAction,
  onRowEdit,
  onRowDelete,
  onRowView,
  onRowToggleStatus,
  actions,
  bulkActions = [
    { label: "Copy", action: "copy", icon: <Copy className="h-4 w-4 mr-2" /> },
    { label: "Export", action: "export", icon: <Download className="h-4 w-4 mr-2" /> },
    { label: "Delete", action: "delete", icon: <Trash2 className="h-4 w-4 mr-2" />, variant: "destructive" as const },
  ],
  emptyMessage = "No data available",
  refreshButton,
  addButton
}: AdvancedTableProps<T>) {
  const { settings, updateSettings, resetSettings, isLoaded } = useTableSettings(columns)

  const [filters, setFilters] = useState<ColumnFilters>(() => {
    const initialFilters: ColumnFilters = {}
    columns.forEach(col => {
      if (col.filterable !== false) {
        initialFilters[col.key] = col.filterType === "select" ? "all" : ""
      }
    })
    return initialFilters
  })

  const defaultColumnWidths = useMemo(() => {
    const widths: ColumnWidths = {}
    columns.forEach(col => {
      widths[col.key] = col.width || 150
    })
    widths.actions = 120
    return widths
  }, [columns])

  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(defaultColumnWidths)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const tableRef = useRef<HTMLTableElement>(null)

  const columnVisibility = settings.columnVisibility
  const sortColumn = settings.sortColumn
  const sortDirection = settings.sortDirection
  const groupColumn = settings.groupColumn
  const pageSize = settings.pageSize

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    description: string
    action?: () => void
  }>({ title: "", description: "" })
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  const showAlert = (title: string, description: string, action?: () => void) => {
    setAlertConfig({ title, description, action })
    setAlertDialogOpen(true)
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, column: string) => {
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
      const newWidth = Math.max(80, startWidth + diff)

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
    return columns.filter(col => columnVisibility[col.key])
  }, [columns, columnVisibility])

  const uniqueValues = useMemo(() => {
    const values: Record<string, string[]> = {}
    columns.forEach(col => {
      if (col.filterable !== false && col.filterType === "select") {
        values[col.key] = Array.from(new Set(
          data.map(item => String(item[col.key] || "")).filter(Boolean)
        )).sort()
      }
    })
    return values
  }, [data, columns])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return columns.every(col => {
        if (col.filterable === false || !filters[col.key]) return true
        
        const filterValue = filters[col.key]
        if (filterValue === "" || filterValue === "all") return true
        
        const itemValue = String(item[col.key] || "").toLowerCase()
        
        if (col.filterType === "select") {
          return itemValue === filterValue.toLowerCase()
        } else {
          return itemValue.includes(filterValue.toLowerCase())
        }
      })
    })
  }, [data, filters, columns])

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData

    const column = columns.find(col => col.key === sortColumn)
    if (!column || column.sortable === false) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      const aStr = String(aValue || "").toLowerCase()
      const bStr = String(bValue || "").toLowerCase()

      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection, columns])

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = groupColumn ? sortedData : sortedData.slice(startIndex, endIndex)

  const groupedData = useMemo(() => {
    if (!groupColumn) return null

    const groups = sortedData.reduce(
      (acc, item) => {
        const groupKey = String(item[groupColumn] || "Unknown")
        
        if (!acc[groupKey]) {
          acc[groupKey] = []
        }
        acc[groupKey].push(item)
        return acc
      },
      {} as Record<string, T[]>,
    )

    return Object.entries(groups).map(([groupValue, items]) => ({
      groupValue,
      items,
      count: items.length,
    }))
  }, [sortedData, groupColumn])

  React.useEffect(() => {
    if (onRowSelect) {
      onRowSelect(Array.from(selectedRows))
    }
  }, [selectedRows, onRowSelect])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = new Set(paginatedData.map((item) => item.id))
      setSelectedRows(currentPageIds)
    } else {
      setSelectedRows(new Set())
    }
    setLastSelectedIndex(null)
  }

  const handleSelectRow = (itemId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      
      if (checked) {
        newSet.add(itemId)
      } else {
        newSet.delete(itemId)
      }
      
      return newSet
    })
  }
  
  const handleRowClick = (itemId: string, index: number, event: React.MouseEvent) => {
    const isCurrentlySelected = selectedRows.has(itemId)
    
    if (event.shiftKey && lastSelectedIndex !== null) {
      const startIndex = Math.min(lastSelectedIndex, index)
      const endIndex = Math.max(lastSelectedIndex, index)
      
      setSelectedRows((prev) => {
        const newSet = new Set(prev)
        
        for (let i = startIndex; i <= endIndex; i++) {
          if (paginatedData[i]) {
            newSet.add(paginatedData[i].id)
          }
        }
        
        return newSet
      })
    } else {
      handleSelectRow(itemId, !isCurrentlySelected)
    }
    
    setLastSelectedIndex(index)
  }

  const handleBulkActionClick = (action: string) => {
    const selectedItemIds = Array.from(selectedRows)
    
    if (selectedItemIds.length === 0) {
      showAlert(
        "No Items Selected",
        "Please select items to perform this action."
      )
      return
    }

    if (action === "copy") {
      handleCopySelected()
      return
    }

    if (action === "export") {
      handleExportSelected()
      return
    }
    
    if (onBulkAction) {
      onBulkAction(action, selectedItemIds)
    }
    setSelectedRows(new Set())
  }

  const handleCopySelected = () => {
    const selectedItemIds = Array.from(selectedRows)
    const selectedItemsData = data.filter(item => selectedItemIds.includes(item.id))
    
    const headers = visibleColumns.map(col => col.label)
    const rows = selectedItemsData.map(item => 
      visibleColumns.map(col => String(item[col.key] || "N/A"))
    )
    
    const tsvData = [headers, ...rows].map(row => row.join("\t")).join("\n")
    
    navigator.clipboard.writeText(tsvData).then(() => {
      console.log(`Copied ${selectedItemIds.length} item${selectedItemIds.length > 1 ? 's' : ''} to clipboard!`)
    }).catch(() => {
      showAlert("Copy Failed", "Failed to copy to clipboard. Please try again.")
    })
  }
  
  const handleExportSelected = () => {
    const selectedItemIds = Array.from(selectedRows)
    const selectedItemsData = data.filter(item => selectedItemIds.includes(item.id))
    
    const headers = visibleColumns.map(col => col.label)
    const csvRows = [
      headers.join(","),
      ...selectedItemsData.map(item =>
        visibleColumns.map(col => `"${String(item[col.key] || "N/A")}"`).join(",")
      )
    ]
    
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedRows.has(item.id))
  const isIndeterminate = paginatedData.some((item) => selectedRows.has(item.id)) && !isAllSelected

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column || column.sortable === false) return

    let newDirection: SortDirection = "asc"

    if (sortColumn === columnKey) {
      if (sortDirection === "asc") newDirection = "desc"
      else if (sortDirection === "desc") newDirection = null
    }

    updateSettings({
      sortColumn: newDirection ? columnKey : null,
      sortDirection: newDirection,
    })
    setCurrentPage(1)
  }

  const handleGroup = (columnKey: string) => {
    const newGroupColumn = groupColumn === columnKey ? null : columnKey
    updateSettings({ groupColumn: newGroupColumn })
    setExpandedGroups(new Set())
    setCurrentPage(1)
  }

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

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <ArrowUpDown className="h-4 w-4" />
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4" />
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4" />
  }

  const renderColumnHeader = (column: ColumnConfig<T>) => (
    <th
      key={column.key}
      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground relative border-r border-border/50"
      style={{ width: columnWidths[column.key], minWidth: columnWidths[column.key] }}
    >
      <div className="flex items-center gap-2">
        {column.sortable !== false && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
            onClick={() => handleSort(column.key)}
            title={`Sort by ${column.label}`}
          >
            {column.label}
            {getSortIcon(column.key)}
          </Button>
        )}
        {column.sortable === false && (
          <span className="font-medium">{column.label}</span>
        )}
        {column.sortable !== false && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
            onClick={() => handleGroup(column.key)}
            title={`Group by ${column.label}`}
          >
            <Package className="h-3 w-3" />
          </Button>
        )}
        {groupColumn === column.key && (
          <Badge variant="secondary" className="text-xs">
            Grouped
          </Badge>
        )}
      </div>
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, column.key)}
        title="Drag to resize column"
      />
    </th>
  )

  const renderCell = (item: T, column: ColumnConfig<T>) => {
    if (column.render) {
      return column.render(item)
    }
    
    const value = item[column.key]
    if (value === null || value === undefined) return "N/A"
    
    return String(value)
  }

  const renderActions = (item: T) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Actions"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {actions?.view && onRowView && (
          <DropdownMenuItem
            onClick={() => onRowView(item)}
            className="cursor-pointer hover:bg-muted focus:bg-muted"
          >
            {actions.view.icon || <Eye className="mr-2 h-4 w-4" />}
            {actions.view.label}
          </DropdownMenuItem>
        )}
        {actions?.edit && onRowEdit && (
          <DropdownMenuItem
            onClick={() => onRowEdit(item)}
            className="cursor-pointer hover:bg-muted focus:bg-muted"
          >
            {actions.edit.icon || <Edit className="mr-2 h-4 w-4" />}
            {actions.edit.label}
          </DropdownMenuItem>
        )}
        {actions?.custom && actions.custom.map((customAction, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => customAction.onClick(item)}
            className={`cursor-pointer hover:bg-muted focus:bg-muted ${
              customAction.variant === "destructive" 
                ? "text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950/20 dark:focus:bg-red-950/20" 
                : ""
            }`}
          >
            {customAction.icon}
            {customAction.label}
          </DropdownMenuItem>
        ))}
        {(actions?.view || actions?.edit || actions?.custom) && actions?.delete && <DropdownMenuSeparator />}
        {actions?.delete && onRowDelete && (
          <DropdownMenuItem
            onClick={() => onRowDelete(item)}
            className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950/20 dark:focus:bg-red-950/20"
          >
            {actions.delete.icon || <Trash2 className="mr-2 h-4 w-4" />}
            {actions.delete.label}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const clearAllFilters = () => {
    const clearedFilters: ColumnFilters = {}
    columns.forEach(col => {
      if (col.filterable !== false) {
        clearedFilters[col.key] = col.filterType === "select" ? "all" : ""
      }
    })
    setFilters(clearedFilters)
    updateSettings({ sortColumn: null, sortDirection: null, groupColumn: null })
    setExpandedGroups(new Set())
    setSelectedRows(new Set())
    setCurrentPage(1)
  }

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "" && filter !== "all") ||
    sortColumn !== null || groupColumn !== null

  const updateFilter = (columnKey: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: value,
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
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {refreshButton}
          {addButton}
          <TableSettings
            columnVisibility={columnVisibility as ColumnVisibility}
            onVisibilityChange={(newVisibility) => {
              updateSettings({ columnVisibility: newVisibility as typeof columnVisibility })
            }}
            columns={columns.map(col => ({ key: col.key, label: col.label }))}
          />
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {selectedRows.size > 0 && (
          <div className="bg-muted/50 border-b px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm text-muted-foreground font-medium">
                {selectedRows.size} item{selectedRows.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {bulkActions.map((bulkAction, index) => (
                  <Button
                    key={index}
                    variant={bulkAction.variant === "destructive" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleBulkActionClick(bulkAction.action)}
                    title={bulkAction.label}
                  >
                    {bulkAction.icon}
                    {bulkAction.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

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
                {visibleColumns.map((column) => renderColumnHeader(column))}
                {(actions || onRowEdit || onRowDelete || onRowView) && (
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground relative border-r border-border/50"
                    style={{ width: columnWidths.actions, minWidth: columnWidths.actions }}
                  >
                    <span className="font-medium">Actions</span>
                  </th>
                )}
              </tr>
              <tr className="border-b bg-muted/20">
                <td className="h-12 px-4 border-r border-border/50"></td>
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className="h-12 px-4 border-r border-border/50"
                    style={{ width: columnWidths[column.key] }}
                  >
                    {column.filterable === false ? (
                      <div></div>
                    ) : column.filterType === "select" ? (
                      <Select 
                        value={filters[column.key]} 
                        onValueChange={(value) => updateFilter(column.key, value)}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder={`Filter ${column.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {column.label}</SelectItem>
                          {(uniqueValues[column.key] || []).map((value) => (
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
                          placeholder={`Search ${column.label}...`}
                          value={filters[column.key]}
                          onChange={(e) => updateFilter(column.key, e.target.value)}
                          className="h-8 pl-7"
                        />
                      </div>
                    )}
                  </td>
                ))}
                {(actions || onRowEdit || onRowDelete || onRowView) && (
                  <td className="h-12 px-4 border-r border-border/50"></td>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="h-24 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : groupedData ? (
                groupedData.map(({ groupValue, items, count }) => (
                  <React.Fragment key={groupValue}>
                    <tr className="border-b bg-muted/10">
                      <td colSpan={visibleColumns.length + 2} className="h-12 px-4">
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
                          {groupValue} ({count} item{count !== 1 ? "s" : ""})
                        </Button>
                      </td>
                    </tr>
                    {expandedGroups.has(groupValue) &&
                      items.map((item, groupIndex) => (
                        <tr 
                          key={item.id} 
                          className="border-b hover:bg-muted/50 cursor-pointer" 
                          onClick={(e) => handleRowClick(item.id, groupIndex, e)}
                        >
                          <td className="h-12 px-4 border-r border-border/50" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedRows.has(item.id)}
                              onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                              aria-label={`Select item ${item.id}`}
                            />
                          </td>
                          {visibleColumns.map((column) => (
                            <td
                              key={column.key}
                              className="h-12 px-4 border-r border-border/50 overflow-hidden"
                              style={{ width: columnWidths[column.key] }}
                            >
                              <div className="truncate">{renderCell(item, column)}</div>
                            </td>
                          ))}
                          {(actions || onRowEdit || onRowDelete || onRowView) && (
                            <td className="h-12 px-4 border-r border-border/50">
                              {renderActions(item)}
                            </td>
                          )}
                        </tr>
                      ))}
                  </React.Fragment>
                ))
              ) : (
                paginatedData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={(e) => handleRowClick(item.id, index, e)}
                  >
                    <td className="h-12 px-4 border-r border-border/50" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(item.id)}
                        onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                        aria-label={`Select item ${item.id}`}
                      />
                    </td>
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className="h-12 px-4 border-r border-border/50 overflow-hidden"
                        style={{ width: columnWidths[column.key] }}
                      >
                        <div className="truncate">{renderCell(item, column)}</div>
                      </td>
                    ))}
                    {(actions || onRowEdit || onRowDelete || onRowView) && (
                      <td className="h-12 px-4 border-r border-border/50">
                        {renderActions(item)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertConfig.action ? (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  alertConfig.action?.()
                  setAlertDialogOpen(false)
                }}>
                  Confirm
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => setAlertDialogOpen(false)}>
                OK
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}