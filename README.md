# Tech Event Calendar

## Contributing

### Prerequisites

- [pnpm](https://pnpm.io/installation)
- PostgreSQL (see below)

### Initial setup

```sh
cp sample.env .env
pnpm install
```

### Create and migrate the database

If using Docker:

```sh
docker run --name tech-event-calendar-db --env-file .env -p 5432:5432 -d postgres
```

If not using Docker, you need to create a PostgreSQL database named `tech-event-calendar` and configure it as specified in `sample.env`. Once that exists, put the connection string in `.env`.

To migrate the database:

```sh
pnpm run prisma migrate deploy
```

### Start the server

```sh
pnpm run dev
```
