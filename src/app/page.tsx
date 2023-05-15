import Home from "./home";
import { prisma } from "@/db";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      date: true,
      link: true,
      latitude: true,
      longitude: true,
    },
  });
  const serializeableEvents = events.map((event) => ({
    ...event,
    date: event.date.toISOString(),
  }));

  return <Home events={serializeableEvents} />;
}

export const revalidate = 0;
