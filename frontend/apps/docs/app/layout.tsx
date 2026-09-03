import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "@/layouts/notebook";
import Image from "next/image";
import { source } from "@/lib/source";
import { ClipboardPolyfill } from "./clipboard-polyfill";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wardn Docs — GitOps CD",
  description: "Documentation for Wardn — GitOps continuous delivery for Kubernetes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <ClipboardPolyfill />
        <RootProvider
          search={{
            options: {
              type: "static",
              api: "/api/search",
            },
          }}
        >
          <DocsLayout
            nav={{
              title: (
                <div className="flex items-center gap-2">
                  <Image
                    src="/wardn_logo_light.svg"
                    alt="Wardn"
                    width={18}
                    height={18}
                    className="dark:hidden"
                  />
                  <Image
                    src="/wardn_logo_dark.svg"
                    alt="Wardn"
                    width={18}
                    height={18}
                    className="hidden dark:block"
                  />
                  <span className="font-semibold">Wardn Docs</span>
                </div>
              ),
            }}
            githubUrl="https://github.com/future-pirate-king/wardn"
            searchToggle={{
              enabled: true,
            }}
            sidebar={{
              defaultOpenLevel: 1,
            }}
            tree={source.pageTree}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
