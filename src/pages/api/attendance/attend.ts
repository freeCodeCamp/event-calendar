import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/db";
import type { NextApiRequest, NextApiResponse } from "next";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        return await participants(req, res);
    }
    if (req.method === 'POST') {
        return await markAsInterested(req, res);
    }
    if (req.method === 'DELETE') {
        return await deleteInterest(req, res);
    }
    return res.status(404).json({ message: "Not found." });
}

const participants = async (req: NextApiRequest, res: NextApiResponse) => {
    const eventId = req.query.eventId as string | undefined;
    if (!eventId) {
        return res.status(400).json({ message: "Event ID is required." });
    }
    const count = await prisma.userEvent.count({
        where: {
          eventId: eventId,
        },
    });
    return res.status(200).json({ count: count });
};

const deleteInterest = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    const email = session!.user!.email!;
    const uid = await userId(email);
    await prisma.userEvent.deleteMany({
        where: {
            eventId: req.body,
            userId: uid
        }
    });
    return res.status(200).json({ message: "OK." });
}

const markAsInterested = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    const email = session!.user!.email!;
    const uid = await userId(email);
    await prisma.userEvent.create({
        data: {
            userId: uid!,
            eventId: req.body
        }
    });
    return res.status(200).json({ message: "OK." });
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