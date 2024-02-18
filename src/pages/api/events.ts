import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/db";
import { compiler } from "@/validation/compiler";
import { getEmailFromSession } from "@/lib/session-utils";

const createEvent = async (req: NextApiRequest, res: NextApiResponse) => {
  const maybeSession = await getServerSession(req, res, authOptions);

  const { err: sessionErr, data: user } = getEmailFromSession(maybeSession);
  if (sessionErr) return res.status(403).json({ message: sessionErr.message });

  if (!compiler.Check(req.body)) {
    return res.status(400).json({ message: [...compiler.Errors(req.body)] });
  }

  const eventDate = new Date(req.body.date);
  if (eventDate.toString() === "Invalid Date")
    return res.status(400).json({ message: "Invalid date" });

  try {
    await prisma.event.create({
      data: {
        date: eventDate,
        link: req.body.link,
        name: req.body.name,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
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

  await res.revalidate("/");
  res.status(200).json({ message: "Event created" });
};

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const events = await prisma.event.findMany({
      select: {
        link: true,
        name: true,
        date: true,
      },
    });
    res.status(200).json(events);
  } else if (req.method === "POST") {
    await createEvent(req, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handleRequest;
