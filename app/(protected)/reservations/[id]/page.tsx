
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CommentsSection from "@/components/CommentsSection";

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const reservationId = params?.id;
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<any>(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleError, setToggleError] = useState("");

  useEffect(() => {
    if (!reservationId) return;
    setLoading(true);
    setError("");
    fetch(`/api/reservations/${reservationId}`)
      .then(async res => {
        if (!res.ok) throw new Error((await res.json())?.error || "Reserva não encontrada");
        return res.json();
      })
      .then(data => setReservation(data))
      .catch(err => setError(err.message || "Reserva não encontrada"))
      .finally(() => setLoading(false));
    fetch("/api/auth/session")
      .then(res => res.ok ? res.json() : null)
      .then(data => setSession(data))
      .catch(() => setSession(null));
  }, [reservationId]);

  async function handleTogglePaid() {
    if (!reservationId) return;
    setToggleLoading(true);
    setToggleError("");
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !reservation.paid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar status de pagamento.");
      }
      const updated = await res.json();
      setReservation((r: any) => ({ ...r, paid: updated.paid }));
    } catch (err: any) {
      setToggleError(err.message || "Erro ao atualizar status de pagamento.");
    } finally {
      setToggleLoading(false);
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>;
  if (error || !reservation) return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-black">Reserva não encontrada</h1>
      {error && <div className="text-red-600">{error}</div>}
    </main>
  );

  const canMarkPaid = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-black">Detalhes da Reserva</h1>
      <div className="bg-white rounded shadow p-6 mb-4">
        <div className="mb-2 text-black"><b>Quarto:</b> {reservation.room?.name}</div>
        <div className="mb-2 text-black"><b>Hóspede:</b> {reservation.guestName}</div>
        <div className="mb-2 text-black"><b>Valor Pago:</b> € {reservation.valorPago?.toFixed(2) ?? '-'}</div>
        <div className="mb-2 text-black"><b>Data Entrada:</b> {new Date(reservation.startDate).toLocaleString()}</div>
        <div className="mb-2 text-black"><b>Data Saída:</b> {new Date(reservation.endDate).toLocaleString()}</div>
        <div className="mb-2 text-black"><b>Fonte:</b> {reservation.source}</div>
        <div className="mb-2 text-black"><b>Responsável:</b> {reservation.user?.name ?? '-'}</div>
        <div className="mb-2 flex items-center gap-2">
          <b>Status de Pagamento:</b>
          <span className={reservation.paid ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {reservation.paid ? "Pago" : "Pendente"}
          </span>
          {canMarkPaid && (
            <button
              className={`ml-2 px-3 py-1 rounded font-semibold ${reservation.paid ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
              onClick={handleTogglePaid}
              disabled={toggleLoading}
            >
              {toggleLoading ? "Atualizando..." : reservation.paid ? "Marcar como Pendente" : "Marcar como Pago"}
            </button>
          )}
        </div>
        {toggleError && <div className="text-red-600 mt-2">{toggleError}</div>}
      </div>
      <div className="bg-white rounded shadow p-6">
        <h2 className="font-semibold mb-2 text-black">Comentários da Reserva</h2>
        <CommentsSection reservationId={reservation.id} comments={reservation.comments} />
      </div>
    </main>
  );
}
