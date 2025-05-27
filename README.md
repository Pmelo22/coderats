# 🧠 GitHub Contributions Ranking

A web platform built with **Next.js (App Router)** + **NextAuth + Firebase Firestore** that authenticates users via GitHub and displays a real-time ranking based on actual contribution data.

---

## 🚀 Features

- 🔐 GitHub OAuth login (NextAuth)
- 🔎 Real-time contribution tracking via GitHub API:
  - Commits
  - Pull Requests
  - Issues
  - Code Reviewsa
  - Project Diversity
  - Active Days
- 📊 Automatic score calculation based on weighted criteria
- 🏆 Real-time public leaderboard
- 👤 Private profile page with user-specific stats
- 🔄 Auto-sync every 24 hours + manual sync (up to 3x/day)

---

## 🧱 Tech Stack

- [Next.js 13+ (App Router)](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Firestore](https://firebase.google.com/products/firestore)
- [NextAuth.js (GitHub OAuth)](https://next-auth.js.org/)
- [GitHub REST API v3](https://docs.github.com/en/rest)

---

## 🛠️ Setup

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/github-ranking.git
cd github-ranking
```

2. **Create `.env.local` and add:**

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

3. **Install dependencies and start dev server:**

```bash
npm install
npm run dev
```

---

## 🔁 Update Logic

- 📅 User data is updated **automatically once every 24 hours**
- 🔘 Users can trigger **up to 3 manual updates per day**
- 🔒 All data is cached in Firestore to avoid GitHub API overuse

---

## 📦 Project Structure

```
├── app/
│   ├── profile/
│   ├── ranking/
├── lib/
│   ├── firestore-user.ts       ← leaderboard logic + syncing
│   ├── github/
│   │   └── getUserStats.ts     ← GitHub API integration
├── components/                 ← UI components
```

---

## 📈 Scoring Breakdown

| Criteria         | Weight (%) |
|------------------|------------|
| Commits          | 40%        |
| Pull Requests    | 25%        |
| Issues           | 15%        |
| Code Reviews     | 10%        |
| Project Diversity| 5%         |
| Active Days      | 3%         |
| Streak (coming)  | 2%         |

---

## ✨ Future Improvements

- 🧩 Contribution streak tracking
- 🕒 CRON-based background sync (Firebase Functions)
- 📈 Personal dashboard with history

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Credits

- [Next.js](https://nextjs.org/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Firebase](https://firebase.google.com/)
- [Shadcn UI / Tailwind CSS](https://ui.shadcn.dev/)
