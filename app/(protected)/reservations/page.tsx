"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reservations")
      .then(res => res.ok ? res.json() : Promise.reject("Erro ao carregar reservas"))
      .then(data => setReservations(data))
      .catch(() => setError("Erro ao carregar reservas"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>A carregar reservas...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>
      <table className="w-full border-collapse bg-white dark:bg-white text-black">
        <thead className="bg-white dark:bg-white text-black">
          <tr>
            <th className="border p-2">Hóspede</th>
            <th className="border p-2">Quarto</th>
            <th className="border p-2">Datas</th>
            <th className="border p-2">Fonte</th>
            <th className="border p-2">Valor pago</th>
            <th className="border p-2">Pago</th>
            <th className="border p-2">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(res => (
            <tr key={res.id}>
              <td className="border p-2 text-black">{res.guestName}</td>
              <td className="border p-2 text-black">{res.roomName || res.room?.name || ""}</td>
              <td className="border p-2 text-black">{new Date(res.startDate).toLocaleDateString()} a {new Date(res.endDate).toLocaleDateString()}</td>
              <td className="border p-2 text-black">{res.source}</td>
              <td className="border p-2 text-black">{typeof res.valorPago === "number" ? `€${res.valorPago.toFixed(2)}` : "-"}</td>
              <td className="border p-2 text-center text-black">{res.paid ? "✔️" : "❌"}</td>
              <td className="border p-2 text-center">
                <Link href={`/reservations/${res.id}`} className="text-orange-600 underline hover:text-orange-800">Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
