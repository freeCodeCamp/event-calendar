import { defineConfig } from "cypress";

import { prisma } from "./src/db";

import session from "./cypress/fixtures/session.json";

const createTestUser = async () => {
  const user = await prisma.user.upsert({
    where: {
      email: session.user.email,
    },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });

  await prisma.session.upsert({
    where: {
      sessionToken: session.__sessionToken,
    },
    update: {},
    create: {
      expires: new Date(session.expires),
      sessionToken: session.__sessionToken,
      userId: user.id,
    },
  });
};

createTestUser();

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
