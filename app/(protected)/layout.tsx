
"use client";

import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/components/LanguageContext";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, status } = useSession();
  const { language, setLanguage, t } = useLanguage();

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-white text-black">
      <aside className="w-64 bg-orange-500 text-white p-6 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t("dashboard")}</h2>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() =>
              setLanguage(language === "pt" ? "en" : "pt")
            }
            className="px-2 py-1 rounded bg-white text-black text-xs font-bold border border-black transition-colors"
          >
            {language === "pt" ? "PT | EN" : "EN | PT"}
          </button>
        </div>

        {(session?.user as any)?.role === "ADMIN" && (
          <>
            <Link href="/dashboard" passHref>
              <button className="w-full bg-white text-orange-500 font-bold py-2 rounded mb-2 hover:bg-orange-100 transition">{t("dashboard")}</button>
            </Link>
          </>
        )}
        <Link href="/reservations" passHref>
          <button className="w-full bg-white text-orange-500 font-bold py-2 rounded mb-2 hover:bg-orange-100 transition">{t("addReservation")}</button>
        </Link>
        <Link href="/calendar" passHref>
          <button className="w-full bg-white text-orange-500 font-bold py-2 rounded mb-2 hover:bg-orange-100 transition">Agenda</button>
        </Link>
        <Link href="/rooms" passHref>
          <button className="w-full bg-white text-orange-500 font-bold py-2 rounded mb-2 hover:bg-orange-100 transition">{t("rooms")}</button>
        </Link>
        {(session?.user as any)?.role === "ADMIN" && (
          <>
            <Link href="/admin/users" passHref>
              <button className="w-full bg-white text-orange-500 font-bold py-2 rounded mb-2 hover:bg-orange-100 transition">{t("users")}</button>
            </Link>
          </>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-6 w-full bg-white text-orange-500 font-bold py-2 rounded hover:bg-orange-100 transition"
        >
          Terminar sessão
        </button>
      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
