import { type Static, Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
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
  name: Type.String({ minLength: 3, maxLength: 100 }),
  link: Type.String({ format: "uri" }),
  date: Type.String({ format: "date-time" }),
});

export const compiler = TypeCompiler.Compile(schema);

export type EventData = Static<typeof schema>;
