import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      nav={{ title: "Wardn Docs" }}
      sidebar={{
        tabs: [
          {
            title: "Docs",
            url: "/docs",
          },
        ],
        defaultOpenLevel: 1,
      }}
      tree={source.pageTree}
    >
      {children}
    </DocsLayout>
  );
}
