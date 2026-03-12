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

## GitHub Actions CD (Build -> Docker Hub -> EC2)

This repo includes `.github/workflows/deploy.yml` to automate:

1. Build Docker image from `Dockerfile`
2. Push image to Docker Hub (`bunrithbuth/pp`)
3. SSH to EC2 and run `docker compose up -d` with the new tag

### Required GitHub repository secrets

- `EC2_HOST` (example: `ec2-52-14-68-56.us-east-2.compute.amazonaws.com`)
- `EC2_USER` (usually `ec2-user`)
- `EC2_SSH_PRIVATE_KEY` (contents of your private key, e.g. `new.pem`)
- `DOCKERHUB_USERNAME` (example: `bunrithbuth`)
- `DOCKERHUB_TOKEN` (Docker Hub access token)
- `POSTGRES_URL`
- `AUTH_SECRET`
- `AUTH_URL` (recommended)

The workflow runs on pushes to `main` (and manually via `workflow_dispatch`).

### One-time EC2 preparation

Install Docker and Compose on EC2 before first deploy:

```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.27.1/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

Then re-login to EC2 and verify:

```bash
docker --version
docker compose version
```

A reusable EC2 compose template and env example are in `deploy/docker-compose.ec2.yml` and `deploy/.env.ec2.example`.
