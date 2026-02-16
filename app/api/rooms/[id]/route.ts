import { logIntrusionAttempt } from "@/lib/intrusionLogger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    logIntrusionAttempt({ route: "/api/rooms/[id]", method: "GET", reason: "No session", ip: req.headers.get('x-forwarded-for') ?? undefined });
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    logIntrusionAttempt({ route: "/api/rooms/[id]", method: "GET", reason: "Role denied", ip: req.headers.get('x-forwarded-for') ?? undefined });
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { id } = await context.params;
  try {
    // id já obtido acima
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        reservations: true,
        comments: {
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
      },
    });
    if (!room) {
      return NextResponse.json({ error: "Quarto não encontrado" }, { status: 404 });
    }
    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    logIntrusionAttempt({ route: "/api/rooms/[id]", method: "PUT", reason: "No session", ip: req.headers.get('x-forwarded-for') ?? undefined });
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    logIntrusionAttempt({ route: "/api/rooms/[id]", method: "PUT", reason: "Role denied", ip: req.headers.get('x-forwarded-for') ?? undefined });
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { id } = await context.params;
  try {
    // id já obtido acima
    const data = await req.json();
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        photoUrl: data.imageUrl || data.photoUrl || undefined,
      },
    });
    return NextResponse.json(updatedRoom);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar quarto" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    logIntrusionAttempt({ route: "/api/rooms/[id]", method: "DELETE", reason: "No session", ip: req.headers.get('x-forwarded-for') ?? undefined });
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    logIntrusionAttempt({ route: "/api/rooms/[id]", method: "DELETE", reason: "Role denied", ip: req.headers.get('x-forwarded-for') ?? undefined });
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { id } = await context.params;
  try {
    // id já obtido acima
    await prisma.room.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao apagar quarto" }, { status: 500 });
  }
}

