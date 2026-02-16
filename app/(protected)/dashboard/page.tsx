import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/calendar");
  }

  const now = new Date();
  const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayYear = new Date(now.getFullYear(), 0, 1);

  const totalRooms = await prisma.room.count();
  const totalReservations = await prisma.reservation.count();

  const activeReservations = await prisma.reservation.count({
    where: {
      startDate: { lte: now },
      endDate: { gte: now }
    }
  });

  const receitaMes = await prisma.reservation.aggregate({
    _sum: { valorPago: true },
    where: { startDate: { gte: firstDayMonth } }
  });

  const receitaAno = await prisma.reservation.aggregate({
    _sum: { valorPago: true },
    where: { startDate: { gte: firstDayYear } }
  });

  const totalPendente = await prisma.reservation.aggregate({
    _sum: { valorPago: true },
    where: { paid: false }
  });

  const reservasPorSource = await prisma.reservation.groupBy({
    by: ["source"],
    _count: { _all: true }
  });

  const ocupacaoPercent =
    totalRooms === 0
      ? 0
      : Math.round((activeReservations / totalRooms) * 100);

  return (
    <DashboardClient 
      totalRooms={totalRooms}
      totalReservations={totalReservations}
      activeReservations={activeReservations}
      ocupacaoPercent={ocupacaoPercent}
      receitaMes={receitaMes._sum.valorPago ?? 0}
      receitaAno={receitaAno._sum.valorPago ?? 0}
      totalPendente={totalPendente._sum.valorPago ?? 0}
      reservasPorSource={reservasPorSource}
    />
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
      <h3 className="text-sm text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <p className="text-2xl font-bold mt-2 text-black dark:text-white">
        {value}
      </p>
    </div>
  );
}
