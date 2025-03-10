  import { ErrorBoundary } from "@/components/error/error-boundary";
  import Providers from "@/components/Providers";
  import "@/styles/globals.css";

  import { GeistSans } from "geist/font/sans";
  import { type Metadata } from "next";
  export const metadata: Metadata = {
    title: "Dashboard",
    description: "Vitamin shop dashboard",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  };

  export default function RootLayout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className="">
          <Providers>
            <ErrorBoundary>
              <main>{children}</main>
            </ErrorBoundary>
          </Providers>
        </body>
      </html>
    );
  }
