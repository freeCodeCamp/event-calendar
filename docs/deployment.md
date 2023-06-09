# Deployment

## Environment variables

In production, `NEXTAUTH_URL` should be set to the URL of your app.

`NEXTAUTH_SECRET` should be set to a string of at least 32 random characters.

## Migration

First login with the Railway CLI. You can find the instructions [in their docs](https://docs.railway.app/develop/cli).

Once that is done

```bash
railway link
railway service
```

to connect to the right service.

Then run prisma migrate via the Railway CLI

```bash
railway run pnpm prisma migrate deploy
```

## Railway

The default build command `pnpm run build` fails because it does not have the `prisma generate` step. So we need to add that to the build command.

```bash
pnpm run prisma generate && pnpm run build 
```
