import { getEmailFromSession, isStaff } from "@/lib/session-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/db";

const deleteEvent = async (req: NextApiRequest, res: NextApiResponse) => {
  const maybeSession = await getServerSession(req, res, authOptions);

  const { err: sessionErr, data: user } = getEmailFromSession(maybeSession);
  if (sessionErr) return res.status(401).json({ message: sessionErr.message });

  if (isStaff(user.email)) {
    if (!(typeof req.query.id === "string")) {
      return res.status(400).json({ message: "Invalid id provided." });
    } else {
      try {
        await prisma.event.delete({ where: { id: req.query.id } });
        res.revalidate("/");
        res.status(200).json({ id: req.query.id });
      } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Event does not exist" });
      }
    }
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "DELETE") {
    await deleteEvent(req, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handleRequest;
