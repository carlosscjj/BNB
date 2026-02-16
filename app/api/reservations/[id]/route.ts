import { logIntrusionAttempt } from "@/lib/intrusionLogger";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PATCH /api/reservations/[id] - atualizar estado de pagamento
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  const { paid } = await request.json();
  try {
    const updated = await prisma.reservation.update({ where: { id }, data: { paid } });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar pagamento." }, { status: 500 });
  }
}

// DELETE /api/reservations/[id] - apagar reserva
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  try {
    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao apagar reserva." }, { status: 500 });
  }
}

// GET /api/reservations/[id] - detalhes de uma reserva

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    logIntrusionAttempt({ route: "/api/reservations/[id]", method: "GET", reason: "No session", ip: request.headers.get('x-forwarded-for') ?? undefined });
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    logIntrusionAttempt({ route: "/api/reservations/[id]", method: "GET", reason: "Role denied", ip: request.headers.get('x-forwarded-for') ?? undefined });
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      room: true,
      user: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" }
      },
    },
  });
  if (!reservation) return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
  return NextResponse.json(reservation);
}
