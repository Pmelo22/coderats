# Backend Node.js for Ranking System

This project implements a backend service using Node.js to manage user rankings based on their GitHub activity. It exposes RESTful endpoints to sync user data, retrieve rankings, and access detailed user information.

## Project Structure

```
backend
├── src
│   ├── controllers         # Contains request handling logic
│   │   ├── rankingController.js
│   │   └── userController.js
│   ├── routes              # Defines API routes
│   │   ├── rankingRoutes.js
│   │   └── userRoutes.js
│   ├── services            # Contains business logic and external API interactions
│   │   ├── githubService.js
│   │   └── rankingService.js
│   ├── jobs                # Periodic tasks for updating rankings
│   │   └── updateRankingJob.js
│   ├── webhooks            # Handles GitHub webhooks for real-time updates
│   │   └── githubWebhook.js
│   ├── models              # Database models
│   │   └── user.js
│   ├── utils               # Utility functions
│   │   └── index.js
│   └── app.js              # Entry point of the application
├── package.json            # NPM configuration file
├── .env                    # Environment variables
└── README.md               # Project documentation
```

## API Endpoints

- **POST /api/sync-user**
  - Receives a GitHub token, fetches user data, and updates the database.
  
- **GET /api/ranking**
  - Returns the updated ranking of users.

- **GET /api/user/:id**
  - Returns detailed information about a specific user.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables, including GitHub API tokens and database connection strings.

4. Start the server:
   ```
   npm start
   ```

## Additional Features

- **Cron Job**: An optional job can be implemented to periodically update the rankings of all users.
- **Webhooks**: GitHub webhooks can be set up for real-time updates of user data.

## Security

Ensure that sensitive tokens are never exposed to the frontend. The backend handles all interactions with the GitHub API securely.