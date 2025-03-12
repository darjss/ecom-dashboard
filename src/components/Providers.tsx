"use client"
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";


function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}


const Providers = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        {/* <ReactScan/> */}
        {children}
        <Toaster />
        <SpeedInsights />
      </NuqsAdapter>
    </QueryClientProvider>
  );
};
export default Providers;
