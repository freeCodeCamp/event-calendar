import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "@/db";

// TODO: create a env.ts file to validate the env variables
if (!process.env.AUTH0_CLIENT_ID) throw new Error("AUTH0_CLIENT_ID is not set");
if (!process.env.AUTH0_CLIENT_SECRET)
  throw new Error("AUTH0_CLIENT_SECRET is not set");

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER_BASE_URL,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
};
export default NextAuth(authOptions);
