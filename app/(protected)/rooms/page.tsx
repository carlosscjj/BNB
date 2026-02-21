
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RoomsPage() {
  const [deleteError, setDeleteError] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/rooms");
        if (!res.ok) throw new Error("Erro ao carregar quartos");
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
      } catch {
        setRooms([]);
      }
      // Fetch session info para isAdmin
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          setIsAdmin(session?.user?.role === "ADMIN");
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleDelete(id: string) {
    setDeleteError("");
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRooms(rooms.filter(r => r.id !== id));
      } else {
        let data;
        try { data = await res.json(); } catch { data = {}; }
        setDeleteError(data.error || "Erro ao apagar quarto.");
      }
    } catch {
      setDeleteError("Erro ao apagar quarto.");
    }
  }

  return (
    <main className="p-0 md:p-8">
      <div className="w-full bg-orange-500 text-white py-4 px-2 md:px-6 flex flex-col md:flex-row items-center justify-between mb-6 rounded-b-lg shadow">
        <h1 className="text-xl md:text-2xl font-bold">Quartos</h1>
        {isAdmin && (
          <Link href="/rooms/new" className="bg-white text-orange-500 text-base md:text-lg font-bold px-4 md:px-6 py-2 md:py-3 rounded hover:bg-orange-100 transition mt-2 md:mt-0">Novo Quarto</Link>
        )}
      </div>
      {deleteError && <div className="text-red-600 font-semibold text-center mb-2">{deleteError}</div>}
      {loading ? (
        <div className="text-center text-black py-8">Carregando...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center text-black py-8">Nenhum quarto encontrado.</div>
      ) : (
        <ul className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 md:px-0 mt-4">
          {rooms.map((room) => (
            <li key={room.id} className="bg-white rounded shadow flex flex-col hover:shadow-lg transition-colors overflow-hidden">
              {room.photoUrl && (
                <div className="w-full h-48 md:h-56 bg-gray-100 flex items-center justify-center">
                  <img src={room.photoUrl} alt={room.name} className="rounded shadow object-cover w-full h-full" />
                </div>
              )}
              <div className="flex flex-col p-4 md:p-6">
                <span className="font-semibold text-lg md:text-xl text-black mb-1 truncate">{room.name}</span>
                <span className="text-black mb-3 break-words">{room.description}</span>
                <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                  <Link href={`/rooms/${room.id}`} className="text-orange-500 hover:underline font-medium">Ver detalhes</Link>
                  {isAdmin && (
                    <>
                      <Link href={`/rooms/${room.id}/edit`} className="text-blue-600 hover:underline font-medium">Editar</Link>
                      <form onSubmit={e => { e.preventDefault(); handleDelete(room.id); }}>
                        <input type="hidden" name="id" value={room.id} />
                        <button type="submit" className="text-red-600 hover:underline font-medium">Apagar</button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
