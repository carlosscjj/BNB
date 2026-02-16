"use client";
import { useEffect, useState, useMemo } from "react";

import RoomCalendar from "@/components/RoomCalendar";
import CalendarClient from './CalendarClient';

export default function CalendarPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [form, setForm] = useState({ roomId: "", guestName: "", source: "AIRBNB", startDate: "", endDate: "", valorPago: "" });
  // Reservas do quarto selecionado
  const selectedRoomReservations = useMemo(() => {
    if (!form.roomId) return [];
    return reservations.filter(r => r.roomId === form.roomId);
  }, [form.roomId, reservations]);
  // Intervalos ocupados para o datepicker
  const occupiedIntervals = useMemo(() => selectedRoomReservations.map(r => ({
    start: new Date(r.startDate),
    end: new Date(r.endDate)
  })), [selectedRoomReservations]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [session, setSession] = useState<any>(null);
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/rooms")
      .then(res => {
        if (!res.ok) {
          throw new Error("Erro ao carregar quartos");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data);
          let all: any[] = [];
          data.forEach((room: any) => {
            if (room.reservations) {
              all = all.concat(room.reservations.map((r: any) => ({ ...r, roomName: room.name })));
            }
          });
          setReservations(all);
        } else {
          setRooms([]);
          setReservations([]);
        }
      })
      .catch(err => {
        console.error(err);
        setRooms([]);
        setReservations([]);
      });
    fetch("/api/auth/session")
      .then(res => res.ok ? res.json() : null)
      .then(data => setSession(data))
      .catch(() => setSession(null));
  }, []);

  async function handleAddReservation(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validação local de conflito de datas
    const newStart = new Date(form.startDate);
    const newEnd = new Date(form.endDate);
    const conflict = selectedRoomReservations.some(r =>
      newStart < new Date(r.endDate) && newEnd > new Date(r.startDate)
    );
    if (conflict) {
      setError("Este quarto já está reservado nestas datas.");
      return;
    }
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valorPago: form.valorPago ? Number(form.valorPago) : undefined }),
    });
    if (res.ok) {
      setSuccess("Reserva adicionada!");
      setForm({ roomId: "", guestName: "", source: "AIRBNB", startDate: "", endDate: "", valorPago: "" });
      // Atualizar reservas
      const data = await res.json();
      setReservations(r => [...r, { ...data, roomName: rooms.find(rm => rm.id === data.roomId)?.name }]);
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao adicionar reserva.");
    }
  }

  async function handleRemoveReservation(id: string) {
    if (!confirm("Remover esta reserva?")) return;
    const res = await fetch("/api/reservations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setReservations(r => r.filter(res => res.id !== id));
    }
  }

  async function handleTogglePaid(id: string, paid: boolean) {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar status de pagamento.");
      }
      setReservations(r => r.map(res => res.id === id ? { ...res, paid } : res));
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Erro ao atualizar status de pagamento.");
      } else {
        alert("Erro ao atualizar status de pagamento.");
      }
    }
  }

  return <CalendarClient 
    reservations={reservations}
    rooms={rooms}
    form={form}
    setForm={setForm}
    error={error}
    success={success}
    handleAddReservation={handleAddReservation}
    handleRemoveReservation={handleRemoveReservation}
    handleTogglePaid={handleTogglePaid}
    isAdmin={isAdmin}
    occupiedIntervals={occupiedIntervals}
  />;
}
