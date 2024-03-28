import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/db";
import type { NextApiRequest, NextApiResponse } from "next";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        return await isUserInterested(req, res);
    }
    return res.status(404).json({ message: "Not found." });
}

const isUserInterested = async (req: NextApiRequest, res: NextApiResponse) => {
    const eventId = req.query.eventId as string | undefined;
    const session = await getServerSession(req, res, authOptions);
    const email = session!.user!.email!;
    const uid = await userId(email);
    const found = await prisma.userEvent.findFirst({
        where: {
          userId: uid!,
          eventId: eventId,
        },
    });
    return res.status(200).json({ isInterested: found ? true : false });
}

const userId = async(email: string) : Promise<string | undefined> => {
    const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
        },
    });
    return user!.id;
}

export default handleRequest;