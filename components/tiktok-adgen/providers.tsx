"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { I18nProvider } from "@/lib/i18n/context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <I18nProvider>{children}</I18nProvider>
    </ClerkProvider>
  );
}
