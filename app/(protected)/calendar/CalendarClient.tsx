"use client";
import RoomCalendar from "@/components/RoomCalendar";

interface Reservation {
  id: string;
  roomId: string;
  guestName: string;
  source: string;
  startDate: string;
  endDate: string;
  valorPago?: number;
  paid: boolean;
  roomName?: string;
}
interface Room {
  id: string;
  name: string;
  reservations?: Reservation[];
}
interface CalendarClientProps {
  reservations: Reservation[];
  rooms: Room[];
  form: {
    roomId: string;
    guestName: string;
    source: string;
    startDate: string;
    endDate: string;
    valorPago: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    roomId: string;
    guestName: string;
    source: string;
    startDate: string;
    endDate: string;
    valorPago: string;
  }>>;
  error: string;
  success: string;
  handleAddReservation: (e: React.FormEvent) => void;
  handleRemoveReservation: (id: string) => void;
  handleTogglePaid: (id: string, paid: boolean) => void;
  isAdmin: boolean;
  occupiedIntervals: { start: Date; end: Date }[];
}

export default function CalendarClient({
  reservations,
  rooms,
  form,
  setForm,
  error,
  success,
  handleAddReservation,
  handleRemoveReservation,
  handleTogglePaid,
  isAdmin,
  occupiedIntervals,
}: CalendarClientProps) {
  return (
    <main className="p-8 max-w-5xl mx-auto bg-white text-black transition-colors">
      <h1 className="text-2xl font-bold mb-4 text-orange-500">Calendário Geral</h1>
      <form onSubmit={handleAddReservation} className="mb-6 flex flex-wrap gap-2 items-end bg-white p-4 rounded shadow transition-colors">
        <select name="roomId" value={form.roomId} onChange={e => setForm((f: typeof form) => ({ ...f, roomId: e.target.value }))} className="border p-2 rounded" required>
          <option value="">Selecione o quarto</option>
          {rooms.map((room: Room) => <option key={room.id} value={room.id}>{room.name}</option>)}
        </select>
        <input name="guestName" value={form.guestName} onChange={e => setForm((f: typeof form) => ({ ...f, guestName: e.target.value }))} placeholder="Hóspede" className="border p-2 rounded" required />
        <select name="source" value={form.source} onChange={e => setForm((f: typeof form) => ({ ...f, source: e.target.value as string }))} className="border p-2 rounded">
          <option value="AIRBNB">Airbnb</option>
          <option value="BOOKING">Booking</option>
        </select>
        {/*
          Para bloqueio visual de datas ocupadas, recomenda-se usar um componente datepicker com suporte a excludeDateIntervals.
          Exemplo com react-datepicker:
          <DatePicker
            selected={form.startDate ? new Date(form.startDate) : null}
            onChange={date => setForm(f => ({ ...f, startDate: date ? date.toISOString().slice(0,10) : "" }))}
            excludeDateIntervals={occupiedIntervals}
            ...
          />
        */}
        <input type="date" name="startDate" value={form.startDate} onChange={e => setForm((f: typeof form) => ({ ...f, startDate: e.target.value }))} className="border p-2 rounded" required />
        <input type="date" name="endDate" value={form.endDate} onChange={e => setForm((f: typeof form) => ({ ...f, endDate: e.target.value }))} className="border p-2 rounded" required />
        <input
          name="valorPago"
          type="number"
          min="0"
          step="0.01"
          value={form.valorPago}
          onChange={e => setForm((f: typeof form) => ({ ...f, valorPago: e.target.value }))}
          placeholder="Valor pago (€)"
          className="border p-2 rounded w-32"
        />
        <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600">Adicionar Reserva</button>
        {error && <span className="text-red-600 ml-2">{error}</span>}
        {success && <span className="text-green-600 ml-2">{success}</span>}
      </form>
      <RoomCalendar
        reservations={reservations}
        showRoomNames
        userRole={isAdmin ? "ADMIN" : undefined}
        onTogglePaid={isAdmin ? handleTogglePaid : undefined}
      />
      <div className="mt-4">
        <h2 className="font-bold mb-2">Remover Reserva</h2>
        <ul className="space-y-1">
          {reservations.map((res: Reservation) => (
            <li key={res.id} className="flex items-center gap-2 text-sm">
              <span>{res.roomName} - {res.guestName} ({res.source}) {new Date(res.startDate).toLocaleDateString()} a {new Date(res.endDate).toLocaleDateString()}</span>
              <button onClick={() => handleRemoveReservation(res.id)} className="text-red-600 hover:underline">Remover</button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
