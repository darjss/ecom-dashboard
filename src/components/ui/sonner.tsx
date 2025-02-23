"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

import type * as React from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-base border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark p-6 pr-8 transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full bg-main text-text",
          title: "text-sm font-heading",
          description: "text-sm font-base",
          actionButton:
            "inline-flex h-8 shrink-0 items-center justify-center rounded-base border-2 border-border dark:border-darkBorder bg-white px-3 text-sm font-base text-text ring-offset-white transition-colors disabled:pointer-events-none disabled:opacity-50",
          cancelButton:
            "inline-flex h-8 shrink-0 items-center justify-center rounded-base border-2 border-border dark:border-darkBorder bg-white px-3 text-sm font-base text-text ring-offset-white transition-colors disabled:pointer-events-none disabled:opacity-50",
          closeButton:
            "absolute right-2 top-2 rounded-md p-1 text-text text-inherit opacity-0 transition-opacity group-hover:opacity-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

