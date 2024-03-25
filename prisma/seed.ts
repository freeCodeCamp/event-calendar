import { prisma } from "../src/db";

import session from "../cypress/fixtures/session.json";
import events25To50Km from "../cypress/fixtures/events-25-to-50km.json";

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

const createEvents = async () => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const data = events25To50Km.map((event) => ({
    ...event,
    creatorId: user.id,
    organizedBy: session.user.name,
  }));
  await prisma.event.createMany({
    data,
  });
};

export const setupDb = async () => {
  await createTestUser();
  await createEvents();
};

setupDb();
