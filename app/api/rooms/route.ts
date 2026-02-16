import { prisma } from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
});

async function uploadToCloudinary(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "rooms" },
      (error, result) => {
        if (error || !result) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(buffer);
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const rooms = await prisma.room.findMany({
    include: { reservations: true },
  });

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
  const photo = formData.get("photo") as File | null;

  let photoUrl: string | undefined;

  if (photo && photo.size > 0) {
    photoUrl = await uploadToCloudinary(photo);
  }

  const room = await prisma.room.create({
    data: {
      name,
      description,
      photoUrl,
    },
  });

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
  const photo = formData.get("photo") as File | null;

  let photoUrl: string | undefined = formData.get("photoUrl") as string;

  if (photo && photo.size > 0) {
    photoUrl = await uploadToCloudinary(photo);
  }

  const room = await prisma.room.update({
    where: { id },
    data: {
      name,
      description,
      photoUrl,
    },
  });

  return NextResponse.json(room);
}
