"use client";
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
