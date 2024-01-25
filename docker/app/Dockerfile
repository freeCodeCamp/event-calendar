FROM node:20-alpine as base
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update
RUN apk add --no-cache libc6-compat
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

FROM base as build
RUN npm i -g pnpm@8
USER node
WORKDIR /app/build
# First copy the package.json and pnpm-lock.yaml to leverage Docker cache
COPY --chown=node:node package.json pnpm-lock.yaml ./
# We don't need Cypress in production
RUN CYPRESS_INSTALL_BINARY=0 pnpm install
# Now we need the source to build the app
COPY --chown=node:node . .
RUN pnpm prisma generate
RUN pnpm run build

FROM base as production
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/build/.next/standalone ./
COPY --from=build --chown=node:node /app/build/.next/static ./.next/static
COPY --from=build /app/build/public ./public
USER node
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]