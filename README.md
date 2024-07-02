# Tech Event Calendar

## Contributing

### Running with docker compose
Go to project's root and execute:
```
docker-compose -f docker/app/docker-compose.yaml -p tech-event-calendar up -d --build
```
After the database has loaded, run:
```
pnpm prisma migrate deploy
```

### Running without docker compose

#### Prerequisites

- [pnpm](https://pnpm.io/installation)
- PostgreSQL (see below)

#### Initial setup

```sh
cp sample.env .env
pnpm install
```

#### Create and migrate the database

If using Docker:

```sh
docker run --name tech-event-calendar-db --env-file .env -p 5432:5432 -d postgres
```

If not using Docker, you need to create a PostgreSQL database named `tech-event-calendar` and configure it as specified in `sample.env`. Once that exists, put the connection string in `.env`.

To migrate the database:

```sh
pnpm prisma migrate deploy
```

#### Start the server

```sh
pnpm run dev
```