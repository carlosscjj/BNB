"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Currency = "EUR" | "USD" | "CVE";

interface CurrencyContextProps {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  formatCurrency: (value: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.ok ? res.json() : { currency: "EUR" })
      .then(data => {
        setCurrencyState(data.currency || "EUR");
        setLoading(false);
      })
      .catch(() => {
        setCurrencyState("EUR");
        setLoading(false);
      });
  }, []);

  async function setCurrency(currency: Currency) {
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency }),
    });
    if (res.ok) {
      const data = await res.json();
      setCurrencyState(data.currency);
    }
    setLoading(false);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: currency,
    }).format(value);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
