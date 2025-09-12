"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertConfig {
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  cancelLabel?: string;
}

export function useAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    title: "",
    description: "",
  });

  const showAlert = (alertConfig: AlertConfig) => {
    setConfig(alertConfig);
    setIsOpen(true);
  };

  const hideAlert = () => {
    setIsOpen(false);
    setConfig({ title: "", description: "" });
  };

  const AlertComponent = () => (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>{config.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {config.action ? (
            <>
              <AlertDialogCancel onClick={hideAlert}>
                {config.cancelLabel || "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  config.action?.();
                  hideAlert();
                }}
              >
                {config.actionLabel || "Confirm"}
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={hideAlert}>
              OK
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
}