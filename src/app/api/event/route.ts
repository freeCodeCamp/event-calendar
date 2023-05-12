import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/db";
import { compiler } from "@/validation/compiler";
import { revalidatePath } from "next/cache";

type ValidationFailure = {
  err: Error;
  data: null;
};

type ValidationSuccess<T> = {
  err: null;
  data: T;
};

type Validated<T> = ValidationFailure | ValidationSuccess<T>;

const getEmailFromSession = (
  session: Session | null
): Validated<{ email: string }> => {
  if (!session) return { err: Error("No session"), data: null };
  if (!session.user) return { err: Error("No user"), data: null };
  if (!session.user.email) return { err: Error("No email"), data: null };

  return { err: null, data: { email: session.user.email } };
};

export const POST = async (req: NextRequest) => {
  const maybeSession = await getServerSession(authOptions);

  const { err: sessionErr, data: user } = getEmailFromSession(maybeSession);
  if (sessionErr)
    return new Response(JSON.stringify({ message: sessionErr.message }), {
      status: 403,
    });

  const body = await req.json();
  if (!compiler.Check(body)) {
    return new Response(
      JSON.stringify({ message: [...compiler.Errors(body)] }),
      {
        status: 400,
      }
    );
  }

  const eventDate = new Date(body.date);

  if (eventDate.toString() === "Invalid Date")
    return new Response(JSON.stringify({ message: "Invalid date" }), {
      status: 400,
    });

  try {
    await prisma.event.create({
      data: {
        date: eventDate,
        link: body.link,
        name: body.name,
        latitude: body.latitude,
        longitude: body.longitude,
        creator: {
          connect: {
            email: user.email,
          },
        },
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Could not create event" }), {
      status: 500,
    });
  }

  revalidatePath("/");
  return NextResponse.json({ message: "Event created" });
};
