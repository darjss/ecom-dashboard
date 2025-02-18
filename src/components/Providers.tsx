import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";


const Providers = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <NuqsAdapter>
      {children}
      <Toaster />
    </NuqsAdapter>
  );
};
export default Providers;
