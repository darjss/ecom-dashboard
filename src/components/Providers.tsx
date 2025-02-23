import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"


const Providers = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <NuqsAdapter>
      {children}
      <Toaster />
      <SpeedInsights/>
    </NuqsAdapter>
  );
};
export default Providers;
