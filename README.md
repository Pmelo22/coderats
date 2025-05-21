# GitHub Ranking Website

A web application that ranks GitHub users based on their contributions, built with Next.js, Supabase, and GitHub OAuth.

## Features

- GitHub authentication
- Contribution leaderboard
- User profiles with detailed statistics
- Automatic ranking updates every 12 hours

## Prerequisites

- Node.js 18+ and npm
- GitHub OAuth application

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron job secret
CRON_SECRET_KEY=your_cron_secret_key
```

# Firebase
As variáveis de ambiente do Firebase estão em `.env.local`.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Setting Up the Cron Job

To update the rankings every 12 hours, you need to set up a cron job that calls the update-rankings API endpoint.

### Using Vercel Cron Jobs

If you're deploying to Vercel, you can use Vercel Cron Jobs:

1. Create a `vercel.json` file in the root directory:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-rankings",
      "schedule": "0 */12 * * *"
    }
  ]
}
```

2. Make sure to add the `CRON_SECRET_KEY` environment variable to your Vercel project.

### Using an External Cron Service

If you're not using Vercel, you can use an external cron service like [Cron-job.org](https://cron-job.org/) or [GitHub Actions](https://github.com/features/actions):

1. Set up a cron job to make a GET request to `https://your-domain.com/api/cron/update-rankings` every 12 hours.
2. Include the authorization header: `Authorization: Bearer your_cron_secret_key`

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Add the environment variables to your Vercel project
4. Deploy!

## License

MIT
