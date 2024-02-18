import type { Session } from "next-auth";

type ValidationFailure = {
  err: Error;
  data: null;
};

type ValidationSuccess<T> = {
  err: null;
  data: T;
};

type Validated<T> = ValidationFailure | ValidationSuccess<T>;

export const isStaff = (email?: string): boolean =>
  !!email && email.endsWith("@freecodecamp.org");

export const getEmailFromSession = (
  session: Session | null
): Validated<{ email: string }> => {
  if (!session) return { err: Error("No session"), data: null };
  if (!session.user) return { err: Error("No user"), data: null };
  if (!session.user.email) return { err: Error("No email"), data: null };

  return { err: null, data: { email: session.user.email } };
};