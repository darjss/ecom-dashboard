"use client"
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TRPCReactProvider } from "@/trpc/react";





const Providers = ({ children }: Readonly<{ children: React.ReactNode }>) => {

  return (
    <TRPCReactProvider >
      <NuqsAdapter>
        {children}
         {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
        <Toaster />
        <SpeedInsights />
      </NuqsAdapter>
    </TRPCReactProvider>
  );
};
export default Providers;
