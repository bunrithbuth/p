## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## Docker (Production-style with Compose)

Run the app in a production container locally:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

View logs:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Stop and remove the container:

```bash
docker compose -f docker-compose.prod.yml down
```

If you need database-backed pages, set `POSTGRES_URL` and `AUTH_SECRET` in your shell before starting Compose.
