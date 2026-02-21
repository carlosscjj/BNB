"use client";
import { useLanguage } from "./LanguageContext";
import React from "react";
import { Analytics } from '@vercel/analytics/next';

export default function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  return (
    <html lang={language}>
      <body className="bg-white text-black antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
