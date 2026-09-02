"use client";

import { useEffect } from "react";

export function ClipboardPolyfill() {
  useEffect(() => {
    if (navigator.clipboard) return;

    const handler = (text: string) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(textarea);
      return Promise.resolve();
    };

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: handler,
        readText: () => Promise.resolve(""),
      },
      writable: true,
      configurable: true,
    });
  }, []);

  return null;
}
