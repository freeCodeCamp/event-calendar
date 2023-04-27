import { TypeCompiler } from "@sinclair/typebox/compiler";

import { schema } from "./schema";

export const compiler = TypeCompiler.Compile(schema);
