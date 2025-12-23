"use client";

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus } from "lucide-react";
import CreateEventModal from "./CreateEventModal";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: { filled: number; capacity: number; isCritical: boolean };
};

export default function AdminCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>(Views.MONTH);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Load events from API
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/events");
      if (!res.ok) return;
      const data = await res.json();
      const mapped: CalendarEvent[] = data.map((evt: any) => ({
        id: evt.id,
        title: evt.title,
        start: new Date(evt.start_time),
        end: new Date(evt.end_time),
        resource: {
          filled: evt.filled ?? 0,
          capacity: evt.capacity ?? 0,
          isCritical: false,
        },
      }));
      setEvents(mapped);
    };
    load();
  }, []);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (newEvent: any) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newEvent.title,
        start_time: newEvent.start.toISOString(),
        end_time: newEvent.end.toISOString(),
        sub_shifts: newEvent.subShifts.map((s: any) => ({
          role_name: s.roleName,
          start_time: `${newEvent.start.toISOString().split("T")[0]}T${s.startTime}:00Z`,
          end_time: `${newEvent.end.toISOString().split("T")[0]}T${s.endTime}:00Z`,
          capacity: s.capacity,
        })),
      }),
    });
    if (!res.ok) {
      // Could show error toast
      return;
    }
    const created = await res.json();
    setEvents([
      ...events,
      {
        id: created.id,
        title: created.title,
        start: new Date(created.start_time),
        end: new Date(created.end_time),
        resource: {
          filled: 0,
          capacity: (created.capacity ?? 0),
          isCritical: false,
        },
      },
    ]);
  };

  const eventStyleGetter = (event: any) => {
    const isCritical = event.resource?.isCritical;
    const style = {
      backgroundColor: isCritical ? "#fee2e2" : "#dbeafe", // red-100 or blue-100
      color: isCritical ? "#991b1b" : "#1e40af", // red-800 or blue-800
      border: isCritical ? "2px solid #ef4444" : "1px solid #93c5fd",
      borderRadius: "6px",
      display: "block",
    };
    return { style };
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Event Schedule</h2>
        <button
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
          onClick={() => {
            setSelectedDate(new Date());
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        view={view}
        onView={setView}
        selectable
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventStyleGetter}
        components={{
          event: ({ event }: any) => (
            <div className="p-1">
              <div className="font-semibold text-xs">{event.title}</div>
              <div className="text-[10px] mt-1">
                {event.resource.filled}/{event.resource.capacity} Staff
              </div>
            </div>
          ),
        }}
      />

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
      />
    </div>
  );
}
