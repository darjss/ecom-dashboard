import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import type { Metadata } from "next"
import { Suspense } from "react"
import type React from "react" // Added import for React

export const metadata: Metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full">
      <Suspense>
        <SidebarProvider>
          <AppSidebar />``
          <div className="flex w-full flex-1 flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto bg-background">
              <div className="container mx-auto h-full w-full p-4 md:p-6 lg:p-8">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </Suspense>
    </div>
  )
}

