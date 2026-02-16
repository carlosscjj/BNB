import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/settings
export async function GET() {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    // Valor padrão EUR se não existir
    settings = await prisma.siteSettings.create({ data: { currency: "EUR" } });
  }
  return NextResponse.json({ currency: settings.currency });
}

// PATCH /api/settings
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { currency } = await req.json();
  if (!currency || !["EUR", "USD", "CVE"].includes(currency)) {
    return NextResponse.json({ error: "Moeda inválida" }, { status: 400 });
  }
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { currency } });
  } else {
    settings = await prisma.siteSettings.update({ where: { id: settings.id }, data: { currency } });
  }
  return NextResponse.json({ currency: settings.currency });
}
