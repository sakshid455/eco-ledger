import { collection, CollectionReference, Firestore } from "firebase/firestore";

export function safeCollection(
  db: Firestore | null | undefined,
  name?: string
): (CollectionReference & { __memo?: boolean }) | null {

  if (!db) return null;
  if (!name) return null;

  const ref = collection(db, name);
  (ref as any).__memo = true;

  return ref as any;
}