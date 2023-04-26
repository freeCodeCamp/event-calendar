import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

type EventData = {
  name: string;
  link: string;
  date: string;
};

export default function AddEvent() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<EventData>();

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
      </div>
      <div>
        <label htmlFor="link">Url: </label>
        <input type="url" required {...register("link", { required: true })} />
      </div>
      <div>
        <label htmlFor="date">Date: </label>
        <input
          type="datetime-local"
          required
          {...register("date", { required: true })}
        />
      </div>
      <div>
        <input type="submit" value="Create Event" />
      </div>
    </form>
  );
}
