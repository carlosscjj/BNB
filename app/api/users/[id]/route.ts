export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao apagar utilizador." }, { status: 500 });
  }
}


// ...existing code...

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  const { name, email, role } = await req.json();
  if (!name || !email || !role) {
    return NextResponse.json({ error: "Dados obrigatórios" }, { status: 400 });
  }
  if (!['ADMIN', 'STAFF'].includes(role)) {
    return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
  }
  // Verificar se email já existe em outro utilizador
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== id) {
    return NextResponse.json({ error: "Email já existe" }, { status: 400 });
  }
  try {
    const user = await prisma.user.update({ where: { id }, data: { name, email, role } });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao editar utilizador." }, { status: 500 });
  }
}
