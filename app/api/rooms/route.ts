export const runtime = "nodejs";
import { prisma } from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function getCloudinaryConfig() {
  // Prefer variáveis separadas, mas aceita CLOUDINARY_URL se presente
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL?.split('@')[1];
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.split('://')[1]?.split(':')[0];
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.split(':')[2]?.split('@')[0];
  return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
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


  console.log("ENV DEBUG:");
  console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("API_KEY:", process.env.CLOUDINARY_API_KEY);
  console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING");

  const { v2: cloudinary } = await import("cloudinary");
  const config = getCloudinaryConfig();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    return NextResponse.json({ error: "Cloudinary não está configurado corretamente. Verifique as variáveis de ambiente." }, { status: 500 });
  }
  cloudinary.config(config);

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const photo = formData.get("photo") as File | null;

  let photoUrl: string | undefined = undefined;

  if (photo && photo instanceof File) {
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "rooms" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    photoUrl = uploadResult.secure_url;
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

  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
  }

  if (photo && photo instanceof File) {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });

    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "rooms" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    photoUrl = uploadResult.secure_url;
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
