"use client";
// Types for RoomCalendar
export interface Reservation {
  id: string;
  guestName: string;
  valorPago?: number;
  paid: boolean;
  startDate: string | Date;
  endDate: string | Date;
  source: string;
  roomName?: string;
}

export interface RoomCalendarProps {
  reservations: Reservation[];
  showRoomNames?: boolean;
  userRole?: string;
  onTogglePaid?: (id: string, paid: boolean) => void;
}
import { useState } from "react";
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt';
import enLocale from '@fullcalendar/core/locales/en-gb';
import { useLanguage } from "./LanguageContext";


// Cores para cada fonte de reserva
const sourceColors: Record<string, string> = {
  AIRBNB: "#FF5A5F",
  BOOKING: "#003580",
  DIRECT: "#22c55e",
  EXPEDIA: "#F5A623",
  OUTRO: "#6366f1",
};



export default function RoomCalendar({ reservations, showRoomNames = false, userRole, onTogglePaid }: RoomCalendarProps & { userRole?: string }) {
  const { language: currentLanguage } = useLanguage();
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  // Filtro por quarto: se showRoomNames, permite filtro, senão mostra apenas reservas do quarto atual
  const filteredReservations = showRoomNames
    ? (selectedRoom ? reservations.filter(r => r.roomName === selectedRoom) : reservations)
    : reservations;

  // Eventos customizados
  const events = filteredReservations.map((res: Reservation) => ({
    id: res.id,
    title: `${res.guestName}\n€${res.valorPago?.toFixed(2) ?? '-'}\n${res.paid ? '✔' : '❌'}`,
    start: res.startDate,
    end: res.endDate,
    backgroundColor: sourceColors[res.source] || '#f3f4f6',
    borderColor: res.paid ? '#22c55e' : undefined,
    extendedProps: { res },
    allDay: true,
  }));

  const handleEventClick = (info: any) => {
    const res = info.event.extendedProps.res;
    if (res && res.id) {
      router.push(`/reservations/${res.id}`);
    }
  };

  // Listar quartos únicos para filtro
  const roomNames = Array.from(new Set(reservations.map(r => r.roomName).filter(Boolean)));

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="mb-4 flex gap-2 items-center">
        <label className="font-semibold text-black">Filtrar por quarto:</label>
        <select
          className="border p-2 rounded text-black dark:text-black"
          value={selectedRoom}
          onChange={e => setSelectedRoom(e.target.value)}
        >
          <option value="">Todos</option>
          {roomNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* FullCalendar Component */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        locale={currentLanguage === 'pt' ? ptLocale : enLocale}
        height="auto"
      />

      {/* Lista de Reservas - Agora em baixo */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3 text-black">Estado das Reservas</h3>
        <ul className="space-y-2">
          {filteredReservations.map(res => (
            <li key={res.id} className="flex items-center justify-between gap-2 text-sm bg-white border border-gray-200 p-3 rounded">
              <span className="text-black">{showRoomNames && res.roomName ? `${res.roomName} - ` : ""}{res.guestName} ({res.source})</span>
              <span className="text-black text-xs">{new Date(res.startDate).toLocaleDateString()} a {new Date(res.endDate).toLocaleDateString()}</span>
              <span className={res.paid ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{res.paid ? "✓ Pago" : "✗ Pendente"}</span>
              {(userRole === "ADMIN" || userRole === "STAFF") && onTogglePaid && (
                <button
                  className={`ml-2 px-2 py-1 rounded font-semibold text-xs ${res.paid ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}
                  onClick={() => onTogglePaid(res.id, !res.paid)}
                >
                  {res.paid ? "Pendente" : "Pago"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
