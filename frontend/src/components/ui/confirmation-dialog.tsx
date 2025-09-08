"use client"

import { useState, ReactNode, useCallback } from "react"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Loader2, AlertTriangle, Trash2, Edit, UserX, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning"
  icon?: ReactNode
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon,
  loading = false,
}: ConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (isProcessing) return; // Prevent double-execution
    
    try {
      setIsProcessing(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("Confirmation action failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [onConfirm, onOpenChange, isProcessing])

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          buttonVariant: "destructive" as const,
          iconColor: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800"
        }
      case "warning":
        return {
          buttonVariant: "default" as const,
          iconColor: "text-amber-600",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800"
        }
      default:
        return {
          buttonVariant: "default" as const,
          iconColor: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800"
        }
    }
  }

  const styles = getVariantStyles()
  const isLoading = loading || isProcessing

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.bgColor} ${styles.borderColor} border`}>
                <span className={styles.iconColor}>{icon}</span>
              </div>
            )}
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-base leading-relaxed mt-4">
          {description}
        </AlertDialogDescription>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel 
            disabled={isLoading}
            className="sm:mr-3"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(buttonVariants({ variant: styles.buttonVariant }), "min-w-[100px]")}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Pre-configured variants for common use cases
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false,
}: Omit<ConfirmationDialogProps, "variant" | "icon" | "confirmText" | "cancelText">) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      icon={<Trash2 className="h-5 w-5" />}
      loading={loading}
    />
  )
}

export function EditConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false,
}: Omit<ConfirmationDialogProps, "variant" | "icon" | "confirmText" | "cancelText">) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText="Save Changes"
      cancelText="Cancel"
      variant="default"
      icon={<Edit className="h-5 w-5" />}
      loading={loading}
    />
  )
}

export function DeactivateConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false,
}: Omit<ConfirmationDialogProps, "variant" | "icon" | "confirmText" | "cancelText">) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText="Deactivate"
      cancelText="Cancel"
      variant="warning"
      icon={<UserX className="h-5 w-5" />}
      loading={loading}
    />
  )
}

export function RoleChangeConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false,
}: Omit<ConfirmationDialogProps, "variant" | "icon" | "confirmText" | "cancelText">) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText="Update Roles"
      cancelText="Cancel"
      variant="default"
      icon={<Shield className="h-5 w-5" />}
      loading={loading}
    />
  )
}

export function HardDeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false,
}: Omit<ConfirmationDialogProps, "variant" | "icon" | "confirmText" | "cancelText">) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText="Delete Permanently"
      cancelText="Cancel"
      variant="destructive"
      icon={<AlertTriangle className="h-5 w-5" />}
      loading={loading}
    />
  )
}

export function BulkActionConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  variant = "warning",
  loading = false,
}: Omit<ConfirmationDialogProps, "icon" | "cancelText"> & {
  variant?: "destructive" | "warning" | "default"
}) {
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <Trash2 className="h-5 w-5" />
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Edit className="h-5 w-5" />
    }
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText="Cancel"
      variant={variant}
      icon={getIcon()}
      loading={loading}
    />
  )
}