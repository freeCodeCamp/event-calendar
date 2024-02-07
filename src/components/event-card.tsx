import { format } from "date-fns";
import type { EventWithDistance } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { getEmailFromSession, isStaff } from "@/lib/session-utils";
import { Button } from "@mui/material";
import AlertDialog from "./alert-dialog";

export function EventCard({ event }: { event: EventWithDistance }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { data } = getEmailFromSession(session);
  const canDelete = isStaff(data?.email);

  async function deleteEvent(id: string) {
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    router.reload();
  }

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
      {canDelete && (
        <AlertDialog
          openText="Delete"
          dialogText="Are you sure you want to delete this event?"
          agreeText="Delete"
          disagreeText="Cancel"
          onAgree={() => deleteEvent(event.id)}
        />
      )}
    </div>
  );
}
