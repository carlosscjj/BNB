"use client";
import DashboardChartsClient from "./DashboardChartsClient";
import { useEffect, useState } from "react";
// Os gráficos são renderizados por DashboardChartsClient

interface DashboardClientProps {
  totalRooms: number;
  totalReservations: number;
  activeReservations: number;
  ocupacaoPercent: number;
  receitaMes: number;
  receitaAno: number;
  totalPendente: number;
  reservasPorSource: Array<{ source: string; _count: { _all: number } }>;
}

export default function DashboardClient({
    // Os gráficos devem ser renderizados em um componente separado client-side
  totalRooms,
  totalReservations,
  activeReservations,
  ocupacaoPercent,
  receitaMes,
  receitaAno,
  totalPendente,
  reservasPorSource,
}: DashboardClientProps) {
  const { t } = require("@/components/LanguageContext").useLanguage();
  return (
    <div className="p-8 space-y-8 bg-white text-black min-h-screen">
      <h1 className="text-3xl font-bold text-orange-500">
        {t("dashboard")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card title={t("rooms") + " " + t("total")} value={totalRooms} />
        <Card title={t("reservation") + " " + t("total")} value={totalReservations} />
        <Card title={t("activeReservations")} value={activeReservations} />
        <Card title={t("occupancy")} value={`${ocupacaoPercent}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title={t("monthEarnings")} value={receitaMes} />
        <Card title={t("yearEarnings")} value={receitaAno} />
        <Card title={t("unpaid") + " " + t("total")} value={totalPendente} />
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-orange-500">
          {t("platformDistribution")}
        </h2>
        <div className="space-y-2">
          {reservasPorSource.map((item: { source: string; _count: { _all: number } }) => (
            <div key={item.source} className="flex justify-between">
              <span>{item.source}</span>
              <span>{item._count._all}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos de ganhos e reservas por mês ficam abaixo das informações */}
      <DashboardChartsClient />
    </div>
  );
}

interface CardProps {
  title: string;
  value: any;
}

function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-sm text-black">
        {title}
      </h3>
      <p className="text-2xl font-bold mt-2 text-black">
        {value}
      </p>
    </div>
  );
}
