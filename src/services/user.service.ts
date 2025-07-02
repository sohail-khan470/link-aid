// src/services/user.service.ts
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { User } from "firebase/auth";

class UserService {
  private db = getFirestore();

  async createUserProfile(
    user: User,
    additionalData: {
      username: string;
      phone?: string;
      phoneNumber?: string;
      language?: string;
      theme?: string;
      role?: string;
      createdAt: Date;
    }
  ): Promise<void> {
    try {
      const userRef = doc(this.db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        fullName: additionalData.username,
        language: additionalData.language,
        phone: additionalData.phone || null,
        role: additionalData.role,
        theme: additionalData.theme,
        createdAt: new Date(),
      });
    } catch (error) {
      throw new Error("Failed to create user profile");
    }
  }
}

export default UserService;
