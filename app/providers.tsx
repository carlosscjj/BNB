
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/components/LanguageContext";
import { CurrencyProvider } from "@/components/CurrencyContext";

interface ProvidersProps {
  children: ReactNode;
  session: any;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
