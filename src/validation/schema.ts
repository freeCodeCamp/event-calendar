import { type Static, Type } from "@sinclair/typebox";
import { TypeSystem } from "@sinclair/typebox/system";
import isURL from "validator/es/lib/isURL";
import isISO8601 from "validator/es/lib/isISO8601";

const globalForValidation = global as unknown as {
  __formatsAdded: boolean | undefined;
};

// Without this check, the format will be added twice (once by the server and
// once by the client) causing an error to be thrown.
if (!globalForValidation.__formatsAdded) {
  TypeSystem.Format("date-time", (val) => isISO8601(val, { strict: true }) && val.slice(-1) === "Z");

  TypeSystem.Format("uri", (val) =>
    isURL(val, { protocols: ["http", "https"] })
  );
  globalForValidation.__formatsAdded = true;
}

export const locationSchema = Type.Object({
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitude: Type.Number({ minimum: -180, maximum: 180 }),
});

export const eventSchema = Type.Composite([
  Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    link: Type.String({ format: "uri" }),
    date: Type.String({ format: "date-time" }),
  }),
  locationSchema,
]);

export type EventData = Static<typeof eventSchema>;
export type Location = Static<typeof locationSchema>;
