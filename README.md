# SDK Success Dashboard

A dashboard to track quantitative SDK success metrics from GitHub, npm, and PyPI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Neon Postgres + Drizzle ORM
- **Charts:** Recharts
- **Deployment:** Vercel

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Create a `.env.local` file for local development:

```env
# Database (Neon Postgres)
DATABASE_URL=

# GitHub API (optional - for higher rate limits)
GITHUB_TOKEN=
```

### Variable Details

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (for DB features) | Neon Postgres connection string. Get this from [Neon Console](https://console.neon.tech/) or Vercel Storage |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token. Increases API rate limit from 60 to 5,000 requests/hour. [Create one here](https://github.com/settings/tokens) |

## Database Setup

This project uses [Drizzle ORM](https://orm.drizzle.team/) with Neon Postgres.

### Available Commands

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema directly (development)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Initial Setup

1. Create a database at [Neon](https://console.neon.tech/) or via Vercel Storage
2. Copy the connection string to `DATABASE_URL` in `.env.local`
3. Push the schema to create tables:
   ```bash
   npm run db:push
   ```

## Vercel Deployment Setup

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import this GitHub repository

2. **Create Postgres Database**
   - In Vercel Dashboard → Storage → Create Database → Neon Postgres
   - Connect it to your project
   - `DATABASE_URL` will be automatically added to environment variables

3. **Run Database Migration**
   - After first deploy, run migrations or use `db:push` locally with production DATABASE_URL

4. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `GITHUB_TOKEN` (optional but recommended)

5. **Deploy**
   - Push to `main` branch to trigger deployment

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Postgres](https://neon.tech/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)
