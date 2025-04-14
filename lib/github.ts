// This file would contain functions to interact with the GitHub API
// For demonstration purposes, we're using mock data

export async function fetchUserProfile(username: string) {
  // In a real app, this would fetch data from the GitHub API
  console.log(`Fetching profile for ${username}...`)

  // Return mock data
  return {
    id: 1,
    username,
    name: "John Doe",
    avatarUrl: "/placeholder.svg?height=200&width=200&query=developer profile",
    bio: "Full-stack developer passionate about open source",
    company: "GitHub",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    joinedDate: "Joined January 2018",
    followers: 245,
    following: 123,
  }
}

export async function fetchUserRepositories(username: string) {
  // In a real app, this would fetch repositories from the GitHub API
  console.log(`Fetching repositories for ${username}...`)

  // Return mock data
  return [
    {
      id: 1,
      name: "awesome-project",
      description: "A really awesome project that does amazing things",
      language: "TypeScript",
      stars: 342,
      forks: 87,
      updatedAt: "Updated 2 days ago",
    },
    {
      id: 2,
      name: "react-components",
      description: "A collection of reusable React components",
      language: "JavaScript",
      stars: 156,
      forks: 34,
      updatedAt: "Updated 1 week ago",
    },
    {
      id: 3,
      name: "api-toolkit",
      description: "Tools for building and consuming APIs",
      language: "TypeScript",
      stars: 98,
      forks: 12,
      updatedAt: "Updated 3 weeks ago",
    },
  ]
}

export async function fetchUserContributions(username: string) {
  // In a real app, this would fetch contribution data from the GitHub API
  console.log(`Fetching contributions for ${username}...`)

  // Return mock data
  return {
    totalContributions: 1872,
    commits: 1245,
    pullRequests: 127,
    issues: 500,
    streak: 42,
    contributionsByMonth: [
      { date: "2023-01", count: 45 },
      { date: "2023-02", count: 52 },
      { date: "2023-03", count: 78 },
      { date: "2023-04", count: 63 },
      { date: "2023-05", count: 92 },
      { date: "2023-06", count: 105 },
      { date: "2023-07", count: 87 },
      { date: "2023-08", count: 120 },
      { date: "2023-09", count: 145 },
      { date: "2023-10", count: 132 },
      { date: "2023-11", count: 98 },
      { date: "2023-12", count: 76 },
    ],
  }
}

export async function fetchRanking() {
  // In a real app, this would fetch ranking data from your database
  console.log("Fetching ranking data...")

  // Return mock data
  return [
    {
      id: 1,
      username: "johndoe",
      name: "John Doe",
      avatarUrl: "/abstract-user-icon.png",
      contributions: 1872,
      commits: 1245,
      pullRequests: 127,
      issues: 500,
      streak: 42,
      rank: 1,
    },
    {
      id: 2,
      username: "janedoe",
      name: "Jane Doe",
      avatarUrl: "/diverse-developer-avatar.png",
      contributions: 1654,
      commits: 1100,
      pullRequests: 154,
      issues: 400,
      streak: 38,
      rank: 2,
    },
    // ... more users
  ]
}
