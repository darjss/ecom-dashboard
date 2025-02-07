import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "@/app/api/uploadthing/core";
import { connection } from "next/server";
import { Suspense } from "react";

async function UTSSR() {
  await connection();

  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}

const Providers = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <NuqsAdapter>
      <Suspense>
        <UTSSR />
      </Suspense>
      {children}
      <Toaster />
    </NuqsAdapter>
  );
};
export default Providers;
