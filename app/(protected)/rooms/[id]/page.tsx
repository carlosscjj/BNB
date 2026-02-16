

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CommentsSection from "@/components/CommentsSection";
import RoomCalendar from "@/components/RoomCalendar";
import Link from "next/link";


export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    setRoom(null);
    fetch(`/api/rooms/${id}`)
      .then(async res => {
        if (!res.ok) {
          const errMsg = (await res.json())?.error || "Quarto não encontrado";
          throw new Error(errMsg);
        }
        return res.json();
      })
      .then(data => {
        if (!cancelled) setRoom(data);
      })
      .catch(err => {
        if (!cancelled) setError(err.message || "Quarto não encontrado");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    fetch("/api/auth/session")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (!cancelled) setSession(data); })
      .catch(() => { if (!cancelled) setSession(null); });
    return () => { cancelled = true; };
  }, [id]);

  const isAdmin = session?.user?.role === "ADMIN";

  async function handleTogglePaid(reservationId: string, paid: boolean) {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar status de pagamento.");
      }
      setRoom((room: any) => ({
        ...room,
        reservations: room.reservations.map((r: any) => r.id === reservationId ? { ...r, paid } : r)
      }));
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar status de pagamento.");
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!room) return null;

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-black dark:text-gray-100">{room.name}</h1>
        <Link href={`/rooms/${room.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold">Editar</Link>
      </div>
      {room.photoUrl && (
        <img src={room.photoUrl} alt={room.name} className="mb-4 rounded shadow max-w-xs" />
      )}
      <p className="mb-4 text-black dark:text-gray-100">{room.description}</p>
      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-black dark:text-gray-100">Calendário de Reservas</h2>
        <RoomCalendar
          reservations={room.reservations}
          userRole={isAdmin ? "ADMIN" : undefined}
          onTogglePaid={isAdmin ? handleTogglePaid : undefined}
        />
      </section>
      <section>
        <h2 className="font-semibold mb-2 text-black dark:text-gray-100">Comentários Internos</h2>
        <CommentsSection roomId={room.id} comments={room.comments} />
      </section>
    </main>
  );
}
