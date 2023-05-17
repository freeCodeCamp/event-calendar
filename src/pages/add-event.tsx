import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Paper, Button, Stack, TextField, Typography } from "@mui/material";

import { type EventData, eventSchema } from "@/validation/schema";

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
    <Paper
      variant="outlined"
      sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
    >
      <form onSubmit={handleSubmit(postEvent)}>
        <Typography variant="h6" gutterBottom>
          Add event
        </Typography>
        <Stack spacing={2}>
          <TextField
            className="huge-test-name"
            data-cy="input-name"
            type="text"
            required
            label="Event Name"
            error={!!errors.name}
            helperText={
              errors.name &&
              "Event names must be between 1 and 100 characters long"
            }
            {...register("name", { required: true })}
          />

          <TextField
            className="huge-test-name"
            data-cy="input-url"
            type="url"
            required
            label="URL"
            error={!!errors.link}
            helperText={
              errors.link &&
              "URLs must include the protocol (http:// or https://)"
            }
            {...register("link", { required: true })}
          />

          <TextField
            className="huge-test-name"
            data-cy="input-date"
            type="datetime-local"
            required
            label="Date"
            error={!!errors.date}
            helperText={errors.date && "Dates must be ISO8601 compliant"}
            {...register("date", {
              required: true,
              setValueAs: (value) =>
                value ? new Date(value).toISOString() : "",
            })}
          />

          <TextField
            data-cy="input-latitude"
            className="huge-test-name"
            type="text"
            required
            label="Latitude"
            error={!!errors.latitude}
            helperText={
              errors.latitude && "Latitude must be between -90 and 90 inclusive"
            }
            {...register("latitude", { required: true, valueAsNumber: true })}
          />
          <TextField
            data-cy="input-longitude"
            className="huge-test-name"
            type="text"
            required
            label="Longitude"
            error={!!errors.longitude}
            helperText={
              errors.longitude &&
              "Longitude must be between -180 and 180 inclusive"
            }
            {...register("longitude", { required: true, valueAsNumber: true })}
          />

          <Button data-cy="submit-add-event" type="submit">
            Submit
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
