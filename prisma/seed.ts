import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  // Remove duplicados para garantir seed limpo
  await prisma.user.deleteMany({ where: { email: { in: ['admin@local.com', 'staff@local.com'] } } });

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@local.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Funcionário',
      email: 'staff@local.com',
      passwordHash: staffPassword,
      role: 'STAFF',
    },
  });

  // Seed rooms
  const room1 = await prisma.room.create({
    data: {
      name: 'Quarto 101',
      description: 'Quarto duplo com varanda',
    },
  });
  const room2 = await prisma.room.create({
    data: {
      name: 'Quarto 102',
      description: 'Suite com vista mar',
    },
  });

  // Seed reservations
  await prisma.reservation.create({
    data: {
      roomId: room1.id,
      source: 'AIRBNB',
      startDate: new Date('2026-02-20'),
      endDate: new Date('2026-02-25'),
      guestName: 'João Silva',
      userId: admin.id,
    },
  });
  await prisma.reservation.create({
    data: {
      roomId: room2.id,
      source: 'BOOKING',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-05'),
      guestName: 'Maria Costa',
      userId: staff.id,
    },
  });

  // Seed comments
  await prisma.comment.create({
    data: {
      text: 'Cliente chega tarde',
      userId: staff.id,
      roomId: room1.id,
      createdAt: new Date('2026-02-19T18:00:00Z'),
    },
  });
  await prisma.comment.create({
    data: {
      text: 'Problema no ar condicionado',
      userId: staff.id,
      roomId: room2.id,
      createdAt: new Date('2026-03-01T10:00:00Z'),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
