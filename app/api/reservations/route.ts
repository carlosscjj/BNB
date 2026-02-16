
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const reservations = await prisma.reservation.findMany({
    include: { room: true },
    orderBy: { startDate: "desc" }
  });

  return NextResponse.json(reservations);
}
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { roomId, guestName, source, startDate, endDate, valorPago } = await req.json();
  if (!roomId || !guestName || !source || !startDate || !endDate) {
    return NextResponse.json({ error: "Dados obrigatórios" }, { status: 400 });
  }
  // Proteção contra overbooking
  const newStartDate = new Date(startDate);
  const newEndDate = new Date(endDate);
  const existing = await prisma.reservation.findFirst({
    where: {
      roomId,
      startDate: { lt: newEndDate },
      endDate: { gt: newStartDate },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Este quarto já está reservado para estas datas." }, { status: 400 });
  }
  const reservation = await prisma.reservation.create({
    data: {
      roomId,
      guestName,
      source,
      startDate: newStartDate,
      endDate: newEndDate,
      userId: session.user.id,
      ...(valorPago !== undefined && valorPago !== null && valorPago !== "" ? { valorPago: Number(valorPago) } : {}),
    },
  });
  return NextResponse.json(reservation);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
