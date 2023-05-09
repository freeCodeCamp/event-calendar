import { execSync } from "child_process";
import { defineConfig } from "cypress";

import { prisma } from "./src/db";

import session from "./cypress/fixtures/session.json";
import events25To50Km from "./cypress/fixtures/events-25-to-50km.json";

const resetEvents = async () => {
  await prisma.event.deleteMany({});

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const data = events25To50Km.map((event) => ({
    ...event,
    creatorId: user.id,
  }));
  return await prisma.event.createMany({
    data,
  });
};

export default defineConfig({
  projectId: "xs1c9r",
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("before:run", () => {
        console.log("Resetting database");
        execSync("pnpm prisma migrate reset --force");
      });
      on("task", {
        resetEvents,
      });
    },
  },
});
