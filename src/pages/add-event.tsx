import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Button, Stack, Typography } from "@mui/material";

import { type EventData, eventSchema } from "@/validation/schema";
import FormField from "@/components/form-field";

export default function AddEvent() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventData>({
    resolver: typeboxResolver(eventSchema),
  });

  const postEvent = async (event: EventData) => {
    const res = await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (res.ok) {
      router.push("/");
    } else {
      throw new Error("Something went wrong");
    }
  };

  return (
    <form className={"input-form"} onSubmit={handleSubmit(postEvent)}>
      <Typography component="h1" variant="h3">
        Tech Event Calendar
      </Typography>
      <Typography component="h2" variant="h4">
        Add an event
      </Typography>
      <hr />
      <Stack spacing={2}>
        <FormField
          type="text"
          label="Event Name"
          errors={errors}
          helperText="Event names must be between 1 and 100 characters long"
          {...register("name", { required: true })}
        />

        <FormField
          type="url"
          label="URL"
          errors={errors}
          helperText="URLs must include the protocol (http:// or https://)"
          {...register("link", { required: true })}
        />

        <FormField
          type="datetime-local"
          label="Date"
          errors={errors}
          helperText="Dates must be ISO8601 compliant"
          {...register("date", {
            required: true,
            setValueAs: (value) => (value ? new Date(value).toISOString() : ""),
          })}
        />

        <FormField
          type="text"
          label="Latitude"
          errors={errors}
          helperText="Latitude must be between -90 and 90 inclusive"
          dataCy="input-latitude-add"
          {...register("latitude", { required: true, valueAsNumber: true })}
        />
        <FormField
          type="text"
          label="Longitude"
          errors={errors}
          helperText="Longitude must be between -180 and 180 inclusive"
          dataCy="input-longitude-add"
          {...register("longitude", { required: true, valueAsNumber: true })}
        />

        <Button
          data-cy="submit-add-event"
          type="submit"
          className="submit-button"
        >
          Add
        </Button>
      </Stack>
    </form>
  );
}
