import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "MISSING",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING",
    CLOUDINARY_URL: process.env.CLOUDINARY_URL ? "EXISTS" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || "LOCAL",
    debug: {
      message: "Se as variáveis aparecerem como MISSING, configure-as no painel do Vercel em Settings > Environment Variables",
      expected_variables: [
        "CLOUDINARY_CLOUD_NAME=duycpzep8",
        "CLOUDINARY_API_KEY=<sua-chave>",
        "CLOUDINARY_API_SECRET=<seu-segredo>"
      ]
    }
  });
}

