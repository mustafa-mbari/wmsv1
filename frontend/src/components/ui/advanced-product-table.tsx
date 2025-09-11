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
  FileText,
} from "lucide-react"
import React from "react"

export interface ProductData {
  id: string
  name: string
  sku: string
  category: string
  brand?: string
  family?: string
  unit: string
  price: number
  cost: number
  quantity: number
  status: "active" | "inactive" | "discontinued"
  description?: string
  created_at: string
  updated_at: string
}

interface ColumnFilters {
  name: string
  sku: string
  category: string
  brand: string
  family: string
  unit: string
  status: string
  created: string
}

type SortDirection = "asc" | "desc" | null
type SortableColumn = "name" | "sku" | "category" | "brand" | "family" | "unit" | "price" | "cost" | "quantity" | "status" | "created"

interface SortConfig {
  column: SortableColumn | null
  direction: SortDirection
}

interface GroupConfig {
  column: SortableColumn | null
}

interface ColumnWidths {
  name: number
  sku: number
  category: number
  brand: number
  family: number
  unit: number
  price: number
  cost: number
  quantity: number
  status: number
  created: number
  actions: number
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  name: 200,
  sku: 150,
  category: 150,
  brand: 130,
  family: 130,
  unit: 100,
  price: 120,
  cost: 120,
  quantity: 100,
  status: 120,
  created: 130,
  actions: 120,
}

interface AdvancedProductTableProps {
  data: ProductData[]
  loading?: boolean
  onProductSelect?: (productIds: string[]) => void
  onBulkAction?: (action: string, productIds: string[]) => void
  onProductEdit?: (product: ProductData) => void
  onProductDelete?: (product: ProductData) => void
  onProductView?: (product: ProductData) => void
  onProductToggleStatus?: (product: ProductData) => void
}

function useTableSettings() {
  const [settings, setSettings] = useState({
    columnVisibility: {
      name: true,
      sku: true,
      category: true,
      brand: true,
      family: true,
      unit: true,
      price: true,
      cost: true,
      quantity: true,
      status: true,
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
        sku: true,
        category: true,
        brand: true,
        family: true,
        unit: true,
        price: true,
        cost: true,
        quantity: true,
        status: true,
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

export function AdvancedProductTable({ 
  data, 
  loading = false, 
  onProductSelect,
  onBulkAction,
  onProductEdit,
  onProductDelete,
  onProductView,
  onProductToggleStatus
}: AdvancedProductTableProps) {
  const { settings, updateSettings, resetSettings, isLoaded } = useTableSettings()

  const [filters, setFilters] = useState<ColumnFilters>({
    name: "",
    sku: "",
    category: "all",
    brand: "all",
    family: "all",
    unit: "all",
    status: "all",
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
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    description: string;
    action?: () => void;
  }>({ title: "", description: "" })
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  const showAlert = (title: string, description: string, action?: () => void) => {
    setAlertConfig({ title, description, action })
    setAlertDialogOpen(true)
  }

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
    return Object.entries(columnVisibility)
      .filter(([_, visible]) => visible)
      .map(([column]) => column as keyof typeof columnVisibility)
  }, [columnVisibility])

  const uniqueValues = useMemo(
    () => ({
      categories: Array.from(new Set(data.map(product => product.category))).sort(),
      brands: Array.from(new Set(data.map(product => product.brand).filter(Boolean))).sort(),
      families: Array.from(new Set(data.map(product => product.family).filter(Boolean))).sort(),
      units: Array.from(new Set(data.map(product => product.unit))).sort(),
      statuses: ["Active", "Inactive", "Discontinued"],
    }),
    [data],
  )

  const filteredData = useMemo(() => {
    return data.filter((product) => {
      return (
        product.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        product.sku.toLowerCase().includes(filters.sku.toLowerCase()) &&
        (filters.category === "" || filters.category === "all" || product.category.toLowerCase().includes(filters.category.toLowerCase())) &&
        (filters.brand === "" || filters.brand === "all" || (product.brand || "").toLowerCase().includes(filters.brand.toLowerCase())) &&
        (filters.family === "" || filters.family === "all" || (product.family || "").toLowerCase().includes(filters.family.toLowerCase())) &&
        (filters.unit === "" || filters.unit === "all" || product.unit.toLowerCase().includes(filters.unit.toLowerCase())) &&
        (filters.status === "" || filters.status === "all" || product.status === filters.status) &&
        product.created_at.includes(filters.created)
      )
    })
  }, [data, filters])

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortColumn) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "sku":
          aValue = a.sku.toLowerCase()
          bValue = b.sku.toLowerCase()
          break
        case "category":
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        case "brand":
          aValue = (a.brand || "").toLowerCase()
          bValue = (b.brand || "").toLowerCase()
          break
        case "family":
          aValue = (a.family || "").toLowerCase()
          bValue = (b.family || "").toLowerCase()
          break
        case "unit":
          aValue = a.unit.toLowerCase()
          bValue = b.unit.toLowerCase()
          break
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "cost":
          aValue = a.cost
          bValue = b.cost
          break
        case "quantity":
          aValue = a.quantity
          bValue = b.quantity
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "created":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (sortColumn === "price" || sortColumn === "cost" || sortColumn === "quantity" || sortColumn === "created") {
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

  const selectedProducts = useMemo(() => {
    return data.filter((product) => selectedRows.has(product.id))
  }, [data, selectedRows])

  const groupedData = useMemo(() => {
    if (!groupColumn) return null

    const groups = sortedData.reduce(
      (acc, product) => {
        let groupKey = ""
        switch (groupColumn) {
          case "category":
            groupKey = product.category || "No Category"
            break
          case "brand":
            groupKey = product.brand || "No Brand"
            break
          case "family":
            groupKey = product.family || "No Family"
            break
          case "status":
            groupKey = product.status.charAt(0).toUpperCase() + product.status.slice(1)
            break
          default:
            groupKey = String(product[groupColumn as keyof ProductData] || "Unknown")
        }
        
        if (!acc[groupKey]) {
          acc[groupKey] = []
        }
        acc[groupKey].push(product)
        return acc
      },
      {} as Record<string, ProductData[]>,
    )

    return Object.entries(groups).map(([groupValue, products]) => ({
      groupValue,
      products,
      count: products.length,
    }))
  }, [sortedData, groupColumn])

  React.useEffect(() => {
    if (onProductSelect) {
      onProductSelect(Array.from(selectedRows))
    }
  }, [selectedRows, onProductSelect])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = new Set(paginatedData.map((product) => product.id))
      setSelectedRows(currentPageIds)
    } else {
      setSelectedRows(new Set())
    }
    setLastSelectedIndex(null)
  }

  const handleSelectRow = (productId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      
      if (checked) {
        newSet.add(productId)
      } else {
        newSet.delete(productId)
      }
      
      return newSet
    })
  }
  
  const handleRowClick = (productId: string, index: number, event: React.MouseEvent) => {
    const isCurrentlySelected = selectedRows.has(productId)
    
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
      handleSelectRow(productId, !isCurrentlySelected)
    }
    
    setLastSelectedIndex(index)
  }

  const handleBulkDelete = () => {
    const selectedProductIds = Array.from(selectedRows)
    
    if (selectedProductIds.length === 0) {
      showAlert(
        "No Products Selected",
        "Please select products to delete."
      )
      return
    }
    
    if (onBulkAction) {
      onBulkAction("delete", selectedProductIds)
    }
    setSelectedRows(new Set())
  }

  const handleCopySelected = () => {
    const selectedProductIds = Array.from(selectedRows)
    
    if (selectedProductIds.length === 0) {
      showAlert(
        "No Products Selected",
        "Please select products to copy."
      )
      return
    }
    
    const selectedProductsData = data.filter(product => selectedProductIds.includes(product.id))
    
    const headers = ["Name", "SKU", "Category", "Brand", "Family", "Unit", "Price", "Cost", "Quantity", "Status"]
    
    const rows = selectedProductsData.map(product => [
      product.name,
      product.sku,
      product.category,
      product.brand || "N/A",
      product.family || "N/A",
      product.unit,
      product.price.toString(),
      product.cost.toString(),
      product.quantity.toString(),
      product.status.charAt(0).toUpperCase() + product.status.slice(1)
    ])
    
    const tsvData = [headers, ...rows].map(row => row.join("\t")).join("\n")
    
    navigator.clipboard.writeText(tsvData).then(() => {
      console.log(`Copied ${selectedProductIds.length} product${selectedProductIds.length > 1 ? 's' : ''} to clipboard!`)
    }).catch(() => {
      console.error("Failed to copy to clipboard")
      showAlert(
        "Copy Failed",
        "Failed to copy to clipboard. Please try again."
      )
    })
  }
  
  const handleExportSelected = () => {
    const selectedProductIds = Array.from(selectedRows)
    
    if (selectedProductIds.length === 0) {
      showAlert(
        "No Products Selected",
        "Please select products to export."
      )
      return
    }
    
    const selectedProductsData = data.filter(product => selectedProductIds.includes(product.id))
    
    const headers = ["Name", "SKU", "Category", "Brand", "Family", "Unit", "Price", "Cost", "Quantity", "Status", "Created"]
    
    const csvRows = [
      headers.join(","),
      ...selectedProductsData.map(product => [
        `"${product.name}"`,
        `"${product.sku}"`,
        `"${product.category}"`,
        `"${product.brand || "N/A"}"`,
        `"${product.family || "N/A"}"`,
        `"${product.unit}"`,
        `"${product.price}"`,
        `"${product.cost}"`,
        `"${product.quantity}"`,
        `"${product.status.charAt(0).toUpperCase() + product.status.slice(1)}"`,
        `"${formatDate(product.created_at)}"`
      ].join(","))
    ]
    
    const csvContent = csvRows.join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `products-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((product) => selectedRows.has(product.id))
  const isIndeterminate = paginatedData.some((product) => selectedRows.has(product.id)) && !isAllSelected

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "discontinued":
        return "destructive"
      default:
        return "outline"
    }
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
          title={`Sort by ${label}`}
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
          <Package className="h-3 w-3" />
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
      label: "Product Name",
      render: (product: ProductData) => (
        <div className="font-medium">
          {product.name}
        </div>
      ),
    },
    sku: {
      key: "sku" as const,
      label: "SKU",
      render: (product: ProductData) => (
        <span className="font-mono text-sm">{product.sku}</span>
      ),
    },
    category: {
      key: "category" as const,
      label: "Category",
      render: (product: ProductData) => (
        <Badge variant="outline">{product.category}</Badge>
      ),
    },
    brand: {
      key: "brand" as const,
      label: "Brand",
      render: (product: ProductData) => (
        <span className="text-muted-foreground">{product.brand || "N/A"}</span>
      ),
    },
    family: {
      key: "family" as const,
      label: "Family",
      render: (product: ProductData) => (
        <span className="text-muted-foreground">{product.family || "N/A"}</span>
      ),
    },
    unit: {
      key: "unit" as const,
      label: "Unit",
      render: (product: ProductData) => (
        <Badge variant="secondary">{product.unit}</Badge>
      ),
    },
    price: {
      key: "price" as const,
      label: "Price",
      render: (product: ProductData) => (
        <span className="font-medium">{formatCurrency(product.price)}</span>
      ),
    },
    cost: {
      key: "cost" as const,
      label: "Cost",
      render: (product: ProductData) => (
        <span className="text-muted-foreground">{formatCurrency(product.cost)}</span>
      ),
    },
    quantity: {
      key: "quantity" as const,
      label: "Qty",
      render: (product: ProductData) => (
        <span className={`font-medium ${product.quantity <= 10 ? 'text-red-600' : product.quantity <= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
          {product.quantity}
        </span>
      ),
    },
    status: {
      key: "status" as const,
      label: "Status",
      render: (product: ProductData) => (
        <Badge variant={getStatusBadgeVariant(product.status)}>
          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
        </Badge>
      ),
    },
    created: {
      key: "created" as const,
      label: "Created",
      render: (product: ProductData) => (
        <span className="text-muted-foreground">{formatDate(product.created_at)}</span>
      ),
    },
    actions: {
      key: "actions" as const,
      label: "Actions",
      render: (product: ProductData) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-muted"
              title="Product actions"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onProductView?.(product)}
              className="cursor-pointer hover:bg-muted focus:bg-muted"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onProductEdit?.(product)}
              className="cursor-pointer hover:bg-muted focus:bg-muted"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onProductDelete?.(product)}
              className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950/20 dark:focus:bg-red-950/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  }

  const clearAllFilters = () => {
    setFilters({
      name: "",
      sku: "",
      category: "all",
      brand: "all",
      family: "all",
      unit: "all",
      status: "all",
      created: "",
    })
    updateSettings({ sortColumn: null as any, sortDirection: null as any })
    updateSettings({ groupColumn: null as any })
    setExpandedGroups(new Set())
    setSelectedRows(new Set())
    setCurrentPage(1)
  }

  const hasActiveFilters =
    Object.values(filters).some((filter) => filter !== "" && filter !== "all") ||
    sortColumn !== null ||
    groupColumn !== null

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
            <div className="text-muted-foreground">Loading products...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Product Inventory</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <TableSettings
            columnVisibility={columnVisibility as ColumnVisibility}
            onVisibilityChange={(newVisibility) => {
              const typedVisibility = newVisibility as typeof columnVisibility
              updateSettings({ columnVisibility: typedVisibility })
            }}
            columns={[
              { key: 'name', label: 'Product Name' },
              { key: 'sku', label: 'SKU' },
              { key: 'category', label: 'Category' },
              { key: 'brand', label: 'Brand' },
              { key: 'family', label: 'Family' },
              { key: 'unit', label: 'Unit' },
              { key: 'price', label: 'Price' },
              { key: 'cost', label: 'Cost' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'status', label: 'Status' },
              { key: 'created', label: 'Created' },
              { key: 'actions', label: 'Actions' }
            ]}
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
                {selectedRows.size} product{selectedRows.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopySelected}
                  title="Copy selected products to clipboard"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportSelected}
                  title="Export selected products as CSV"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  title="Delete selected products"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
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
              <tr className="border-b bg-muted/20">
                <td className="h-12 px-4 border-r border-border/50"></td>
                {visibleColumns.map((column) => (
                  <td
                    key={column}
                    className="h-12 px-4 border-r border-border/50"
                    style={{ width: columnWidths[column] }}
                  >
                    {column === "actions" ? (
                      <div></div>
                    ) : ["category", "brand", "family", "unit", "status"].includes(column) ? (
                      <Select value={filters[column]} onValueChange={(value) => updateFilter(column, value)}>
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder={`Filter ${column}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {column}</SelectItem>
                          {(column === "category"
                            ? uniqueValues.categories
                            : column === "brand"
                            ? uniqueValues.brands
                            : column === "family"
                            ? uniqueValues.families
                            : column === "unit"
                            ? uniqueValues.units
                            : uniqueValues.statuses
                          ).filter(value => value && value.trim() !== "").map((value) => (
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
                ? groupedData.map(({ groupValue, products, count }) => (
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
                            {groupValue} ({count} product{count !== 1 ? "s" : ""})
                          </Button>
                        </td>
                      </tr>
                      {expandedGroups.has(groupValue) &&
                        products.map((product, groupIndex) => (
                          <tr 
                            key={product.id} 
                            className="border-b hover:bg-muted/50 cursor-pointer" 
                            onClick={(e) => handleRowClick(product.id, groupIndex, e)}
                          >
                            <td className="h-12 px-4 border-r border-border/50" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedRows.has(product.id)}
                                onCheckedChange={(checked) => handleSelectRow(product.id, checked as boolean)}
                                aria-label={`Select ${product.name}`}
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
                                  <div className="truncate">{config.render(product)}</div>
                                </td>
                              ) : null
                            })}
                          </tr>
                        ))}
                    </React.Fragment>
                  ))
                : paginatedData.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={(e) => handleRowClick(product.id, index, e)}
                    >
                      <td className="h-12 px-4 border-r border-border/50" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(product.id)}
                          onCheckedChange={(checked) => handleSelectRow(product.id, checked as boolean)}
                          aria-label={`Select ${product.name}`}
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
                            <div className="truncate">{config.render(product)}</div>
                          </td>
                        ) : null
                      })}
                    </tr>
                  ))}
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