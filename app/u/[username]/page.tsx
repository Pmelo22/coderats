import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface UserProfileProps {
  params: { username: string };
}

async function fetchUserData(username: string) {
  const userDoc = await getDoc(doc(db, "users", username));
  if (!userDoc.exists()) {
    return null;
  }
  return userDoc.data();
}

export default async function PublicUserProfile({ params }: UserProfileProps) {
  const { username } = params;
  const userData = await fetchUserData(username);

  if (!userData) {
    notFound();
  }

  const {
    avatar_url,
    score,
    streak,
    contributions,
    rank,
  } = userData;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <Avatar>
            <AvatarImage src={avatar_url} alt={`${username}'s avatar`} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle>{username}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Score: {score}</p>
          <p>Streak: {streak} days</p>
          {rank && <p>Rank: #{rank}</p>}
          {contributions && (
            <div>
              <h3>Contributions:</h3>
              <img src={contributions} alt="Contribution graph" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
