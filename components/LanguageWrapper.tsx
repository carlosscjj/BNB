import { useLanguage } from "./LanguageContext";
import React from "react";

export default function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  return (
    <html lang={language}>
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}
"use client";
import { LanguageProvider } from "./LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function LanguageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LanguageSwitcher />
      {children}
    </LanguageProvider>
  );
}
