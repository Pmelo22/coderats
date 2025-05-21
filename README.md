# Coderats

## Descrição
Coderats é um projeto incrível que visa resolver problemas complexos de forma eficiente e elegante.

## Funcionalidadess
- Resolução de problemas complexos
- Interface amigável
- Alta performance

## Tecnologias Utilizadas
- Node.js
- Express

## Instalação
Para instalar as dependências do projeto, execute:
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
