"use client";
import { useLanguage } from "./LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
      className="absolute top-2 right-4 z-50 bg-white border rounded px-2 py-1 text-lg shadow hover:bg-gray-100 text-black"
      aria-label="Mudar idioma"
    >
      {language === "pt" ? "🇵🇹 / 🇬🇧" : "🇬🇧 / 🇵🇹"}
    </button>
  );
}
