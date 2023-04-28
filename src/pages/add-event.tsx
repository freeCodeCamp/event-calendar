import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";

import { type EventData, schema } from "@/validation/schema";

export default function AddEvent() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventData>({
    resolver: typeboxResolver(schema),
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
        <input type="text" required {...register("name", { required: true })} />
        {errors.name && (
          <span>Event names must be between 1 and 100 characters long</span>
        )}
      </div>
      <div>
        <label htmlFor="link">Url: </label>
        <input type="url" required {...register("link", { required: true })} />
        {errors.link && (
          <span>URLs must include the protocol (http:// or https://)</span>
        )}
      </div>
      <div>
        <label htmlFor="date">Date: </label>
        <input
          type="datetime-local"
          required
          {...register("date", { required: true })}
        />
        {errors.date && <span>Dates must be ISO8601 compliant</span>}
      </div>
      <div>
        <input type="submit" value="Create Event" />
      </div>
    </form>
  );
}
