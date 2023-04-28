import { TypeCompiler } from "@sinclair/typebox/compiler";

import { eventSchema } from "./schema";

export const compiler = TypeCompiler.Compile(eventSchema);
