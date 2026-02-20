"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reservations")
      .then(res => res.ok ? res.json() : Promise.reject("Erro ao carregar reservas"))
      .then(data => setReservations(data))
      .catch(() => setError("Erro ao carregar reservas"))
      .finally(() => setLoading(false));
    
    fetch("/api/auth/session")
      .then(res => res.ok ? res.json() : null)
      .then(data => setSession(data))
      .catch(() => setSession(null));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem a certeza que quer apagar esta reserva?")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) {
        throw new Error("Erro ao apagar reserva");
      }
      
      setReservations(reservations.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.message || "Erro ao apagar reserva");
    } finally {
      setDeleting(null);
    }
  };

  const isAdmin = session?.user?.role === "ADMIN";

  if (loading) return <div className="p-6">A carregar reservas...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-gray-100">Reservas</h1>
      <table className="w-full border-collapse bg-white dark:bg-white text-black">
        <thead className="bg-gray-100 dark:bg-gray-200 text-black">
          <tr>
            <th className="border p-2 text-left">Hóspede</th>
            <th className="border p-2 text-left">Quarto</th>
            <th className="border p-2 text-left">Datas</th>
            <th className="border p-2 text-left">Fonte</th>
            <th className="border p-2 text-left">Valor pago</th>
            <th className="border p-2 text-center">Pago</th>
            <th className="border p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(res => (
            <tr key={res.id} className="hover:bg-gray-50">
              <td className="border p-2 text-black">{res.guestName}</td>
              <td className="border p-2 text-black">{res.roomName || res.room?.name || ""}</td>
              <td className="border p-2 text-black">{new Date(res.startDate).toLocaleDateString()} a {new Date(res.endDate).toLocaleDateString()}</td>
              <td className="border p-2 text-black">{res.source}</td>
              <td className="border p-2 text-black">{typeof res.valorPago === "number" ? `€${res.valorPago.toFixed(2)}` : "-"}</td>
              <td className="border p-2 text-center text-black">{res.paid ? "✔️" : "❌"}</td>
              <td className="border p-2 text-center">
                <div className="flex gap-2 justify-center">
                  <Link href={`/reservations/${res.id}`} className="text-orange-600 underline hover:text-orange-800 font-semibold">Ver</Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(res.id)}
                      disabled={deleting === res.id}
                      className="text-red-600 hover:text-red-800 font-semibold disabled:opacity-50"
                    >
                      {deleting === res.id ? "Apagando..." : "Apagar"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
