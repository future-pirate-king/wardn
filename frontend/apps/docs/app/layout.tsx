import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import "fumadocs-ui/style.css";
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
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
