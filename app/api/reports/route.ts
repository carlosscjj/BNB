import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const { month, year, type } = await req.json();
  if (!month || !year || !type) {
    return NextResponse.json({ error: "Parâmetros obrigatórios" }, { status: 400 });
  }
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const reservas = await prisma.reservation.findMany({
    where: {
      startDate: { gte: start, lte: end },
    },
    include: { room: true, user: true },
    orderBy: { startDate: "asc" },
  });
  const totalRecebido = reservas.filter(r => r.paid).reduce((acc, r) => acc + (r.valorPago || 0), 0);
  const totalPendente = reservas.filter(r => !r.paid).reduce((acc, r) => acc + (r.valorPago || 0), 0);
  const airbnb = reservas.filter(r => r.source === "AIRBNB");
  const booking = reservas.filter(r => r.source === "BOOKING");
  const totalHospedes = reservas.length;

  if (type === "pdf") {
    const doc = new PDFDocument({ margin: 30 });
    let buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {});
    doc.fontSize(18).text(`Relatório de Reservas - ${month}/${year}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Total Recebido: €${totalRecebido.toFixed(2)}`);
    doc.text(`Total Pendente: €${totalPendente.toFixed(2)}`);
    doc.text(`Total Hóspedes: ${totalHospedes}`);
    doc.moveDown();
    doc.fontSize(14).text("Reservas:");
    reservas.forEach(r => {
      doc.fontSize(11).text(
        `${r.startDate.toLocaleDateString()} - ${r.guestName} - ${r.source} - Quarto: ${r.room?.name ?? "-"} - Valor: €${r.valorPago?.toFixed(2) ?? "-"} - Pago: ${r.paid ? "Sim" : "Não"}`
      );
    });
    doc.moveDown();
    doc.fontSize(13).text(`Airbnb: ${airbnb.length} reservas`);
    doc.fontSize(13).text(`Booking: ${booking.length} reservas`);
    doc.end();
    const pdfBuffer = await new Promise<Buffer>(resolve => {
      const bufs: Buffer[] = [];
      doc.on("data", d => bufs.push(d));
      doc.on("end", () => resolve(Buffer.concat(bufs)));
    });
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfUint8 = new Uint8Array(pdfBuffer);
    return new NextResponse(pdfUint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=relatorio_${month}_${year}.pdf`,
      },
    });
  }

  if (type === "excel") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Reservas");
    sheet.addRow(["Data", "Hóspede", "Fonte", "Quarto", "Valor", "Pago"]);
    reservas.forEach(r => {
      sheet.addRow([
        r.startDate.toLocaleDateString(),
        r.guestName,
        r.source,
        r.room?.name ?? "-",
        r.valorPago?.toFixed(2) ?? "-",
        r.paid ? "Sim" : "Não",
      ]);
    });
    sheet.addRow([]);
    sheet.addRow(["Total Recebido", totalRecebido]);
    sheet.addRow(["Total Pendente", totalPendente]);
    sheet.addRow(["Total Hóspedes", totalHospedes]);
    sheet.addRow(["Airbnb", airbnb.length]);
    sheet.addRow(["Booking", booking.length]);
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=relatorio_${month}_${year}.xlsx`,
      },
    });
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
}
