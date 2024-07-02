import { getServerSession } from "next-auth/next";

import { getEmailFromSession, isStaff } from "@/lib/session-utils";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const { email } = getEmailFromSession(session).data ?? {};

  if (isStaff(email)) {
    try {
      await res.revalidate("/");
      return res.json({ revalidated: true });
    } catch (err) {
      return res.status(500).json({ message: "Could not revalidate" });
    }
  } else {
    res.status(403).end();
  }
}
