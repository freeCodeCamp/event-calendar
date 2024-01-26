import type { Event } from "@prisma/client";

export type EventInfo = { date: string } & Omit<
  Event,
  "createdAt" | "updatedAt" | "creatorId" | "date"
>;

export type EventWithDistance = EventInfo & { distance: number | null };
