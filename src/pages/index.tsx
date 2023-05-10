import Head from "next/head";
import { Inter } from "next/font/google";
import { GetStaticProps } from "next";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import distance from "@turf/distance";
import { point, type Point, type Feature } from "@turf/helpers";

import { prisma } from "@/db";
import { Event } from "@prisma/client";
import { type Location, locationSchema } from "@/validation/schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useForm } from "react-hook-form";
import { Typography } from "@mui/material";

// Given that people can (currently) be assumed to be meeting on the surface of
// the Earth, we can use its circumference to calculate a safe upper bound for
// the great-circle distance between two points on its surface.
const EARTH_CIRCUMFERENCE = "40075.017";

const inter = Inter({ subsets: ["latin"] });

type EventInfo = { date: string } & Omit<
  Event,
  "createdAt" | "updatedAt" | "creatorId" | "date"
>;

type EventWithDistance = EventInfo & { distance: number | null };

type EventProps = {
  events: EventInfo[];
};

export const getStaticProps: GetStaticProps<EventProps> = async () => {
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

  return {
    props: {
      events: serializeableEvents,
    },
    revalidate: 10,
  };
};

function getDistance(userPosition: Feature<Point> | null, event: EventInfo) {
  const eventPosition = point([event.longitude, event.latitude]);
  const distanceToEvent = userPosition
    ? distance(userPosition, eventPosition, {
        units: "kilometers",
      })
    : null;
  return distanceToEvent;
}

function eventInRadius(
  userPosition: Feature<Point> | null,
  event: EventInfo,
  radius: number
) {
  const distanceToEvent = getDistance(userPosition, event);
  return distanceToEvent ? distanceToEvent <= radius : true;
}

function EventCard({ event }: { event: EventWithDistance }) {
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

function LocationForm({
  userPosition,
  onSubmit,
}: {
  userPosition: Feature<Point>;
  onSubmit: (data: Location) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Location>({
    defaultValues: {
      latitude: userPosition?.geometry.coordinates[1],
      longitude: userPosition?.geometry.coordinates[0],
    },
    resolver: typeboxResolver(locationSchema),
  });

  // TODO: DRY this and add-event out, they're almost identical.
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="latitude">Latitude: </label>
        <input
          data-cy="latitude-input"
          type="text"
          required
          {...register("latitude", { required: true, valueAsNumber: true })}
        />
        {errors.latitude && (
          <span>Latitude must be between -90 and 90 inclusive</span>
        )}
      </div>
      <div>
        <label htmlFor="longitude">Longitude: </label>
        <input
          data-cy="longitude-input"
          type="text"
          required
          {...register("longitude", { required: true, valueAsNumber: true })}
        />
        {errors.longitude && (
          <span>Longitude must be between -180 and 180 inclusive</span>
        )}
      </div>
      <input data-cy="submit-location" type="submit" />
    </form>
  );
}

export default function Home({ events }: EventProps) {
  const [userPosition, setUserPosition] = useState<Feature<Point> | null>(null);
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(true);
  const [maxRadius, setMaxRadius] = useState("100");

  useEffect(() => {
    // This is necessary to prevent infinite re-renders.
    if (userPosition) return;

    if (navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition(
            point([position.coords.longitude, position.coords.latitude])
          );
        },
        () => {
          setGeoLocationEnabled(false);
        }
      );
    } else {
      setGeoLocationEnabled(false);
    }
  }, [userPosition]);

  useEffect(() => {
    // NEXT_DISABLE_WHOIS is currently only set in testing and otherwise we can
    // forget about it.
    if (
      !geoLocationEnabled &&
      process.env.NEXT_PUBLIC_DISABLE_WHOIS !== "true"
    ) {
      fetch("https://ipwho.is", {
        method: "GET",
      })
        .then(async (response) => {
          const locationData = (await response.json()) as {
            latitude: number;
            longitude: number;
          };
          setUserPosition(
            point([locationData.longitude, locationData.latitude])
          );
        })
        .catch(() => {
          setUserPosition(point([0, 0]));
        });
    }
  }, [geoLocationEnabled]);

  const eventsInRange = events.filter((event) =>
    eventInRadius(userPosition, event, parseInt(maxRadius, 10))
  );

  const eventsWithDistance = eventsInRange.map((event) => ({
    ...event,
    distance: getDistance(userPosition, event),
  }));

  return (
    <>
      <Head>
        <title>Tech Event Calendar</title>
      </Head>
      <Typography component="h1" variant="h3">
        Tech Event Calendar
      </Typography>
      <Typography component="h2" variant="h4">
        {maxRadius !== EARTH_CIRCUMFERENCE
          ? "Event nearby location:"
          : "All events"}
      </Typography>
      {userPosition && (
        <LocationForm
          userPosition={userPosition}
          onSubmit={({ latitude, longitude }) =>
            setUserPosition(point([longitude, latitude]))
          }
        />
      )}
      {userPosition && (
        <select
          data-cy="radius-select"
          value={maxRadius}
          onChange={(e) => setMaxRadius(e.target.value)}
        >
          {[25, 50, 100].map((radius) => (
            <option key={radius} value={radius}>
              {radius} km
            </option>
          ))}
          <option value={EARTH_CIRCUMFERENCE}>the planet</option>
        </select>
      )}
      {eventsWithDistance.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </>
  );
}
