"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Settings,
  RotateCcw,
  Eye,
  EyeOff
} from "lucide-react"

/**
 * Interface defining the structure of column visibility settings
 * Each key represents a column name, and the boolean value indicates visibility
 */
export interface ColumnVisibility {
  [key: string]: boolean
}

/**
 * Interface defining the properties for the TableSettings component
 */
interface TableSettingsProps {
  /** Current column visibility settings */
  columnVisibility: ColumnVisibility
  /** Function called when column visibility changes */
  onVisibilityChange: (visibility: ColumnVisibility) => void
  /** Array of column definitions with key and display label */
  columns: Array<{
    key: string
    label: string
  }>
  /** Optional custom trigger button */
  trigger?: React.ReactNode
  /** Optional custom class name for the trigger */
  triggerClassName?: string
}

/**
 * Reusable Table Settings Component
 * 
 * This component provides a dropdown interface for controlling table column visibility.
 * Features:
 * - Show/hide individual columns
 * - Visual indicators for visible/hidden columns
 * - Reset all columns to visible
 * - Compact popover interface
 * 
 * Usage:
 * ```tsx
 * <TableSettings
 *   columnVisibility={visibility}
 *   onVisibilityChange={setVisibility}
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'email', label: 'Email' }
 *   ]}
 * />
 * ```
 */
export function TableSettings({
  columnVisibility,
  onVisibilityChange,
  columns,
  trigger,
  triggerClassName = ""
}: TableSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Toggles the visibility of a specific column
   * @param columnKey - The key of the column to toggle
   */
  const toggleColumn = (columnKey: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey]
    }
    onVisibilityChange(newVisibility)
  }

  /**
   * Resets all columns to visible state
   */
  const resetToDefault = () => {
    const resetVisibility = columns.reduce((acc, column) => {
      acc[column.key] = true
      return acc
    }, {} as ColumnVisibility)
    onVisibilityChange(resetVisibility)
  }

  /**
   * Calculates the number of visible and hidden columns
   */
  const visibleCount = Object.values(columnVisibility).filter(Boolean).length
  const hiddenCount = columns.length - visibleCount

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-8 ${triggerClassName}`}
          >
            <Settings className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">
              Columns
            </span>
            {hiddenCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {hiddenCount} hidden
              </Badge>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          {/* Header with summary */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Column Visibility</h4>
            <Badge variant="outline" className="text-xs">
              {visibleCount}/{columns.length} visible
            </Badge>
          </div>

          {/* Reset button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefault}
              className="h-8 px-3 text-xs"
              disabled={visibleCount === columns.length}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Show All
            </Button>
          </div>

          {/* Column visibility toggles */}
          <div className="space-y-3">
            {columns.map((column) => {
              const isVisible = columnVisibility[column.key]
              
              return (
                <div 
                  key={column.key} 
                  className="flex items-center space-x-3"
                >
                  <Checkbox
                    id={`column-${column.key}`}
                    checked={isVisible}
                    onCheckedChange={() => toggleColumn(column.key)}
                  />
                  <Label 
                    htmlFor={`column-${column.key}`} 
                    className="text-sm cursor-pointer flex items-center gap-2 flex-1"
                  >
                    {isVisible ? (
                      <Eye className="h-3 w-3 text-green-500" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={`${isVisible ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {column.label}
                    </span>
                  </Label>
                </div>
              )
            })}
          </div>

          {/* Footer summary */}
          {hiddenCount > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                {hiddenCount} column{hiddenCount !== 1 ? 's' : ''} hidden from view
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Hook for managing table settings state
 * Provides a convenient way to manage column visibility state
 */
export function useTableSettings<T extends Record<string, boolean>>(
  initialVisibility: T
) {
  const [columnVisibility, setColumnVisibility] = useState<T>(initialVisibility)

  const resetToDefault = () => {
    const resetState = Object.keys(initialVisibility).reduce((acc, key) => {
      acc[key as keyof T] = true as T[keyof T]
      return acc
    }, {} as T)
    setColumnVisibility(resetState)
  }

  return {
    columnVisibility,
    setColumnVisibility,
    resetToDefault
  }
}