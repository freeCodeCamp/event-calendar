import Head from "next/head";
import { Inter } from "next/font/google";
import { GetStaticProps } from "next";
import { format, max } from "date-fns";
import { useEffect, useState } from "react";
import distance from "@turf/distance";
import { point, type Point, type Feature } from "@turf/helpers";
import {
  Button,
  Stack,
  Typography,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
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

type EventInfo = { date: string } & Omit<
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
  setMaxRadius,
  maxRadius,
}: {
  userPosition: Feature<Point>;
  onSubmit: (data: Location) => void;
  setMaxRadius: (radius: string) => void;
  maxRadius: string;
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

  const handleChange = (event: SelectChangeEvent<typeof maxRadius>) => {
    const {
      target: { value },
    } = event;
    setMaxRadius(value);
  };

  // TODO: DRY this and add-event out, they're almost identical.
  return (
    <form className={"input-form"} onSubmit={handleSubmit(onSubmit)}>
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
        <InputLabel id="demo-multiple-name-label">Distance Radius:</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          value={maxRadius}
          onChange={handleChange}
          data-cy="radius-select"
          className="radius-selector"
        >
          {[25, 50, 100].map((name) => (
            <MenuItem key={name} value={name}>
              {name} km
            </MenuItem>
          ))}
          <MenuItem value={EARTH_CIRCUMFERENCE}>All</MenuItem>
        </Select>
        <Button
          data-cy="submit-location"
          type="submit"
          className="submit-button"
        >
          Search
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
        Search events by location
      </Typography>
      {userPosition && (
        <>
          <hr />
          <LocationForm
            userPosition={userPosition}
            onSubmit={({ latitude, longitude }) =>
              setUserPosition(point([longitude, latitude]))
            }
            setMaxRadius={setMaxRadius}
            maxRadius={maxRadius}
          />
        </>
      )}
      {eventsWithDistance.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </>
  );
}
