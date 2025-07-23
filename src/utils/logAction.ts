// src/utils/logAction.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

type LogActionParams = {
  userId: string;
  userName: string;
  role: string;
  action: string;
  description: string;
};

export const logAction = async ({
  userId,
  userName,
  role,
  action,
  description,
}: LogActionParams) => {
  try {
    await addDoc(collection(db, "actions_log"), {
      userId,
      userName,
      role,
      action,
      description,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("❌ Failed to log action:", err);
  }
};
