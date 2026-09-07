"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

// Single-theme product (see globals.css) — no next-themes, no dark variant.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--paper-raised)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "t-detail",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
