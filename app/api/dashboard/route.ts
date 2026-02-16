import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const firstDayYear = new Date(year, 0, 1);
  const lastDayYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const [totalRooms, totalReservations, activeReservations, receitaMes, receitaAno, totalPendente, reservasPorSource] = await Promise.all([
    prisma.room.count(),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { startDate: { lte: now }, endDate: { gte: now } } }),
    prisma.reservation.aggregate({
      _sum: { valorPago: true },
      where: { startDate: { gte: firstDay, lte: lastDay } }
    }),
    prisma.reservation.aggregate({
      _sum: { valorPago: true },
      where: { startDate: { gte: firstDayYear, lte: lastDayYear } }
    }),
      prisma.reservation.aggregate({
        _sum: { valorPago: true },
        where: { paid: false }
    }),
    prisma.reservation.groupBy({
      by: ["source"],
      _count: { _all: true }
    })
  ]);

  // Receita por mês do ano
  const receitaPorMes = await prisma.reservation.groupBy({
    by: ["startDate"],
    _sum: { valorPago: true },
    where: { startDate: { gte: firstDayYear, lte: lastDayYear } },
  });

  // Agrupar receita por mês
  const receitaMensal = Array(12).fill(0);
  receitaPorMes.forEach(r => {
    const d = new Date(r.startDate);
    receitaMensal[d.getMonth()] += Number(r._sum.valorPago || 0);
  });

  return NextResponse.json({
    totalRooms,
    totalReservations,
    activeReservations,
    receitaMes: receitaMes._sum.valorPago || 0,
    receitaAno: receitaAno._sum.valorPago || 0,
    totalPendente: totalPendente._sum.valorPago || 0,
    reservasPorSource,
    receitaMensal
  });
}
