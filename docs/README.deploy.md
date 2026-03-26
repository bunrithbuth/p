# Deploy Bootstrap Notes

This file documents what you need when setting up a new repository + Docker image + EC2 deployment.

## Existing project files already present

- `.github/workflows/deploy.yml`
- `Dockerfile`
- `.env.example`
- `docker-compose.prod.yml`
- `deploy/.env.ec2.example`

## Newly generated helper files

- `scripts/ec2-init.sh` (bootstrap Docker on fresh Ubuntu EC2)
- `docs/deploy-flow.mmd` (Mermaid flowchart source)

## Required GitHub Actions secrets

Set these in **Repository secrets** (required by `build-and-push`):

```text
DOCKERHUB_USERNAME=
DOCKERHUB_TOKEN=
```

Set these for deploy in **Environment secrets** under `production` (or Repository secrets if you do not use env scoping):

```text
EC2_HOST=
EC2_USER=
EC2_SSH_PRIVATE_KEY=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
AUTH_SECRET=
AUTH_URL=
```

Notes:
- `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are also used in deploy for remote `docker login`, so repo-level availability is the safest default.
- Image repo is derived from workflow env: `IMAGE_NAME=${DOCKERHUB_USERNAME}/pp`.

## Typical bootstrap order

1. Create GitHub repository and push your app code.
2. Launch Ubuntu EC2 and run `scripts/ec2-init.sh` on the instance.
3. Add all required secrets in GitHub (`Settings -> Secrets and variables -> Actions`).
4. If using environment protection, also add env-specific secrets under `Environments -> production`.
5. Push to `main` (or trigger `workflow_dispatch`) to build images and deploy.

## Generate flowchart PDF locally

Install Mermaid CLI and render the PDF:

```bash
npm install --no-save @mermaid-js/mermaid-cli
npx mmdc -i docs/deploy-flow.mmd -o docs/deploy-flow.pdf
```
