"use client";

import { useCurrency } from "@/components/CurrencyContext";

export default function CurrencySelector() {
  const { currency, setCurrency, loading } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as any)}
      disabled={loading}
      className="px-3 py-2 rounded border bg-white dark:bg-gray-800 text-black dark:text-white"
    >
      <option value="CVE">CVE</option>
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
    </select>
  );
}
