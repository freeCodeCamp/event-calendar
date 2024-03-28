import Head from "next/head";
import { Inter } from "next/font/google";
import { GetStaticProps } from "next";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import distance from "@turf/distance";
import { point, type Point, type Feature } from "@turf/helpers";
import { Button, Stack, Typography } from "@mui/material";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Event } from "@prisma/client";
import { useForm } from "react-hook-form";

import { prisma } from "@/db";
import { type Location, locationSchema } from "@/validation/schema";
import FormField from "@/components/form-field";

// Given that people can (currently) be assumed to be meeting on the surface of
// the Earth, we can use its circumference to calculate a safe upper bound for
// the great-circle distance between two points on its surface.
const EARTH_CIRCUMFERENCE = "40075.017";

const inter = Inter({ subsets: ["latin"] });

type EventInfo = { date: string } & { participants: number } & {isUserInterested: boolean | null} & Omit<
  Event,
  "createdAt" | "updatedAt" | "creatorId" | "date"
>;

type EventWithDistance = EventInfo & { distance: number | null };

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
    serializeableEvents = await Promise.all(events.map(async (event) => {      
      return {
        ...event,
        date: event.date.toISOString(),
        participants: await participants(event.id),
        isUserInterested: null,
      };
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

const participants = async(eventId : string) => {
  const response = await fetch(
    `${process.env.URL}/api/attendance/attend?eventId=${eventId}`,
    {
      method: "GET",
    }
  );
  const data = await response.json();
  return (data as { count: number }).count;
}

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

function EventCard({ e }: { e: EventWithDistance }) {
  const [event, setEvent] = useState<EventWithDistance>(e);
  const [interestButton, setInterestButton] = useState<JSX.Element | null>(null);
  useEffect(() => {
    async function effect() {
      if (event.isUserInterested == null) {
        setEvent({...event, isUserInterested: await isUserInterested(event.id)});
      }
      if (event.isUserInterested === true) {
        setInterestButton(<button onClick={() => {
        handleNotInterestedClick(event);
        setEvent({...event, participants: event.participants - 1, isUserInterested: false});
      }}>{ "Not interested anymore"}</button>);
      }
      else {
        setInterestButton(<button onClick={() => {
          handleInterestedClick(event);
          setEvent({...event, participants: event.participants + 1, isUserInterested: true});
      }}>{ "Interested"}</button>);
      }
    }
    effect();
  }, [event]);
  return (
    <div data-cy="event-card">
      <h2>
        Title: <a href={event.link}>{event.name}</a>
      </h2>
      <h3>Interested: {event.participants}</h3>
      {interestButton}

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

const isUserInterested = async(eventId : string) : Promise<boolean> => {
  const response = await fetch(
    `/api/attendance/user?eventId=${eventId}`,
    {
      method: "GET",
    }
  );
  const data = await response.json();
  return Boolean((data as { isInterested: string; }).isInterested);
};

const handleInterestedClick = async (event : EventWithDistance) => {
  await fetch(
    `/api/attendance/attend`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event.id),
    }
  );
}

const handleNotInterestedClick = async (event : EventWithDistance) => {
  await fetch(
    `/api/attendance/attend`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event.id),
    }
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
      <Stack spacing={2}>
        <FormField
          label="Latitude: "
          type="text"
          helperText="Latitude must be between -90 and 90 inclusive"
          errors={errors}
          {...register("latitude", { required: true, valueAsNumber: true })}
        />
        <FormField
          label="Longitude: "
          type="text"
          helperText="Longitude must be between -180 and 180 inclusive"
          errors={errors}
          {...register("longitude", { required: true, valueAsNumber: true })}
        />
        <Button data-cy="submit-location" type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
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
        <EventCard key={event.id} e={event} />
      ))}
    </>
  );
}
