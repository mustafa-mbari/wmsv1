"use client"

import * as React from "react"
import { useTheme as useNextTheme } from "next-themes"

export function useTheme() {
  return useNextTheme()
}
