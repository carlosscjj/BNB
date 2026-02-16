import { prisma } from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const rooms = await prisma.room.findMany({ include: { reservations: true } });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  let photoUrl: string | undefined = undefined;
  const photo = formData.get("photo");
  if (photo && typeof photo === "object" && "arrayBuffer" in photo) {
    // Salvar arquivo em /public/uploads
    const buffer = Buffer.from(await photo.arrayBuffer());
    const filename = `${Date.now()}_${photo.name}`;
    const fs = require("fs");
    const path = require("path");
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
    fs.writeFileSync(uploadPath, buffer);
    photoUrl = `/uploads/${filename}`;
  }
  const room = await prisma.room.create({ data: { name, description, ...(photoUrl ? { photoUrl } : {}) } });
  return NextResponse.json(room);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const formData = await req.formData();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  let photoUrl: string | undefined = formData.get("photoUrl") as string | undefined;
  const photo = formData.get("photo");
  if (photo && typeof photo === "object" && "arrayBuffer" in photo) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const filename = `${Date.now()}_${photo.name}`;
    const fs = require("fs");
    const path = require("path");
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
    fs.writeFileSync(uploadPath, buffer);
    photoUrl = `/uploads/${filename}`;
  }
  const room = await prisma.room.update({ where: { id }, data: { name, description, ...(photoUrl ? { photoUrl } : {}) } });
  return NextResponse.json(room);
}
