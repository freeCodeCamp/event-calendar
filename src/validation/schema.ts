import { type Static, Type } from "@sinclair/typebox";
import { TypeSystem } from "@sinclair/typebox/system";
import isURL from "validator/es/lib/isURL";
import isISO8601 from "validator/es/lib/isISO8601";

const globalForValidation = global as unknown as {
  __formatsAdded: boolean | undefined;
};

if (!globalForValidation.__formatsAdded) {
  TypeSystem.Format("date-time", isISO8601);

  TypeSystem.Format("uri", (val) =>
    isURL(val, { protocols: ["http", "https"] })
  );
  if (process.env.NODE_ENV !== "production")
    globalForValidation.__formatsAdded = true;
}

export const schema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  link: Type.String({ format: "uri" }),
  date: Type.String({ format: "date-time" }),
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitude: Type.Number({ minimum: -180, maximum: 180 }),
});

export type EventData = Static<typeof schema>;
