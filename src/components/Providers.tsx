"use client"
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactScan } from "./react-scan";

const Providers = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ReactScan/>
        {children}
        <Toaster />
        <SpeedInsights />
      </NuqsAdapter>
    </QueryClientProvider>
  );
};
export default Providers;
