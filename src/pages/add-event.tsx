import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";

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
    <form onSubmit={handleSubmit(postEvent)}>
      <div>
        <label htmlFor="name">Event Name: </label>
        <input
          data-cy="input-name"
          type="text"
          required
          {...register("name", { required: true })}
        />
        {errors.name && (
          <span>Event names must be between 1 and 100 characters long</span>
        )}
      </div>
      <div>
        <label htmlFor="link">Url: </label>
        <input
          data-cy="input-url"
          type="url"
          required
          {...register("link", { required: true })}
        />
        {errors.link && (
          <span>URLs must include the protocol (http:// or https://)</span>
        )}
      </div>
      <div>
        <label htmlFor="date">Date: </label>
        <input
          data-cy="input-date"
          type="datetime-local"
          required
          {...register("date", {
            required: true,
            setValueAs: (value) => (value ? new Date(value).toISOString() : ""),
          })}
        />
        {errors.date && <span>Dates must be ISO8601 compliant</span>}
      </div>
      <div>
        <label htmlFor="latitude">Latitude: </label>
        <input
          data-cy="input-latitude"
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
          data-cy="input-longitude"
          type="text"
          required
          {...register("longitude", { required: true, valueAsNumber: true })}
        />
        {errors.longitude && (
          <span>Longitude must be between -180 and 180 inclusive</span>
        )}
      </div>
      <div>
        <button data-cy="submit-add-event" type="submit">
          Create Event
        </button>
      </div>
    </form>
  );
}
