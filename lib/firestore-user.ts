import { db } from "@/lib/firebase"
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, limit } from "firebase/firestore"

export async function getUserByUid(uid: string) {
  const userRef = doc(db, "users", uid)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() : null
}

export async function setUser(uid: string, data: any) {
  const userRef = doc(db, "users", uid)
  await setDoc(userRef, data, { merge: true })
}

export async function updateUser(uid: string, data: any) {
  const userRef = doc(db, "users", uid)
  await updateDoc(userRef, data)
}

export async function getLeaderboard() {
  const leaderboardRef = collection(db, "leaderboard")
  const q = query(leaderboardRef, orderBy("rank"), limit(100))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => doc.data())
}
