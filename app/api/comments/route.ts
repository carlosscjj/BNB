import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  const { text, roomId, reservationId } = await req.json();
  if (!text || (!roomId && !reservationId)) {
    return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });
  }
  let data: any = { text, userId: session.user.id };
  if (reservationId) {
    data.reservationId = reservationId;
  } else if (roomId) {
    data.roomId = roomId;
  }
  const comment = await prisma.comment.create({
    data,
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(comment);
}
