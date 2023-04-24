import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/db";

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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handleRequest;
