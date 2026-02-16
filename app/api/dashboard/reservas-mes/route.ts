import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Retorna número de reservas por mês do ano atual
  const now = new Date();
  const year = now.getFullYear();
  const meses = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const reservas = await Promise.all(
    meses.map(async (mes, idx) => {
      const start = new Date(year, idx, 1);
      const end = new Date(year, idx + 1, 1);
      const count = await prisma.reservation.count({
        where: {
          startDate: { gte: start, lt: end }
        }
      });
      return {
        mes,
        count
      };
    })
  );

  return NextResponse.json(reservas);
}
