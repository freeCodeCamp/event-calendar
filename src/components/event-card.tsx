import { format } from "date-fns";
import type { EventWithDistance } from "@/types";

export function EventCard({ event }: { event: EventWithDistance }) {
  return (
    <div data-cy="event-card">
      <h2>
        Title: <a href={event.link}>{event.name}</a>
      </h2>

      {/* TODO: replace with a spinner (or similar) to gracefully handle
          the delay between receiving the HTML and the browser rendering 
          the date */}
      <p suppressHydrationWarning>
        Date: {format(new Date(event.date), "E LLLL d, yyyy @ HH:mm")}
      </p>
      {event.distance !== null && (
        <p>Distance to event: {event.distance.toFixed(2)} km</p>
      )}
    </div>
  );
}
