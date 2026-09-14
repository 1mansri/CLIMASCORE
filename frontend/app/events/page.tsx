import { EventCard } from "@/components/event-card";
import { fetchEvents } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await fetchEvents();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">Climate events</p>
        <h1 className="font-serif text-4xl text-navy">Monitored climate events</h1>
        <p className="max-w-2xl text-text-muted">
          Documented public evidence of climate events affecting the Surat textile cluster used in this demo
          portfolio. These are reported external events, not measurements of any individual borrower.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} affectedCount={event.affectedMsmeIds.length} />
        ))}
      </div>
    </div>
  );
}
