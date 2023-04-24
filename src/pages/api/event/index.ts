import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/db";
import { Session } from "next-auth";

type ValidationFailure = {
  err: Error;
  data: null;
};

type ValidationSuccess<T> = {
  err: null;
  data: T;
};

type Validated<T> = ValidationFailure | ValidationSuccess<T>;

type Event = {
  date: string;
  link: string;
  name: string;
};

const expectedEntries = [
  ["date", ["string", "number"]],
  ["link", ["string"]],
  ["name", ["string"]],
] as const;

const parseBody = (body: any): Validated<Event> => {
  if (!body) return { err: new Error("No body"), data: null };

  const keys = Object.keys(body);
  try {
    expectedEntries.forEach(([key, type]) => {
      if (!keys.includes(key)) throw new Error(`Missing key: ${key}`);
      if (!type.includes(typeof body[key]))
        throw new Error(
          `Invalid type: ${key}. Expected ${type}. Actual ${typeof body[key]}`
        );
    });
  } catch (error) {
    if (error instanceof Error) {
      return { err: error, data: null };
    } else {
      return { err: new Error("Could not validate body"), data: null };
    }
  }

  return {
    err: null,
    data: {
      date: body.date,
      link: body.link,
      name: body.name,
    },
  };
};

const getEmailFromSession = (
  session: Session | null
): Validated<{ email: string }> => {
  if (!session) return { err: Error("No session"), data: null };
  if (!session.user) return { err: Error("No user"), data: null };
  if (!session.user.email) return { err: Error("No email"), data: null };

  return { err: null, data: { email: session.user.email } };
};

const createEvent = async (req: NextApiRequest, res: NextApiResponse) => {
  const maybeSession = await getServerSession(req, res, authOptions);

  const { err: sessionErr, data: user } = getEmailFromSession(maybeSession);
  if (sessionErr) return res.status(403).json({ message: sessionErr.message });

  const { err, data } = parseBody(req.body);
  if (err) return res.status(400).json({ message: err.message });

  const eventDate = new Date(data.date);
  if (eventDate.toString() === "Invalid Date")
    return res.status(400).json({ message: "Invalid date" });

  try {
    await prisma.event.create({
      data: {
        date: eventDate,
        link: data.link,
        name: data.name,
        creator: {
          connect: {
            email: user.email,
          },
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not create event" });
  }

  res.status(200).json({ message: "Event created" });
};

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    createEvent(req, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handleRequest;
