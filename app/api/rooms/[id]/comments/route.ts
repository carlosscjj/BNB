import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, context: { params: any }) {
  // Suporte para context.params ser Promise ou objeto direto
  const params = typeof context.params.then === "function" ? await context.params : context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: "Texto obrigatório" }, { status: 400 });
  const comment = await prisma.comment.create({
    data: {
      text,
      userId: session.user.id,
      roomId: params.id,
    },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(comment);
}
