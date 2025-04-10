import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
import LoadingScreen from "@/components/loading-screen";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { Suspense } from "react";
import type React from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Vitamin shop dashboard",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarProvider>
        <AppSidebar />
        <div className="relative flex w-full flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto min-h-[calc(100vh-64px)] w-full p-4 md:p-6 lg:p-8">
              <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
