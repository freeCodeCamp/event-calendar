import Head from "next/head";
import { Inter } from "next/font/google";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import distance from "@turf/distance";
import { point, type Point, type Feature } from "@turf/helpers";
import { Typography } from "@mui/material";

import { prisma } from "@/db";
import { EventCard } from "@/components/event-card";
import { LocationForm } from "@/components/location-form";
import type { EventInfo } from "@/types";

// Given that people can (currently) be assumed to be meeting on the surface of
// the Earth, we can use its circumference to calculate a safe upper bound for
// the great-circle distance between two points on its surface.
const EARTH_CIRCUMFERENCE = "40075.017";

const inter = Inter({ subsets: ["latin"] });

type EventProps = {
  events: EventInfo[];
};

export const getStaticProps: GetStaticProps<EventProps> = async () => {
  let serializeableEvents: EventInfo[] = [];
  try {
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
    serializeableEvents = events.map((event) => ({
      ...event,
      date: event.date.toISOString(),
    }));
  } catch (e) {
    console.log();
    console.log("Error fetching events from database");
    console.log(
      "If this happens while building the image, it's fine, it just means the database isn't available"
    );
    console.log(e);
  }

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

export default function Home({ events }: EventProps) {
  const [userPosition, setUserPosition] = useState<Feature<Point> | null>(null);
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(true);
  const [maxRadius, setMaxRadius] = useState("100");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!geoLocationEnabled) {
      // NEXT_DISABLE_WHOIS is currently only set in testing and otherwise we can
      // forget about it...
      if (process.env.NEXT_DISABLE_WHOIS === "true")
        return setUserPosition(point([0, 0]));
      // ...otherwise continue with the whois lookup
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
          ? "Events nearby location:"
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
