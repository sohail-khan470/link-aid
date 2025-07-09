// src/services/user.service.ts
import {
  doc,
  setDoc,
  getFirestore,
  getDoc,
  collection,
  getDocs,
  DocumentReference,
} from "firebase/firestore";
import { User } from "firebase/auth";

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  language?: string;
  phone?: string | null;
  role?: string;
  theme?: string;
  createdAt: Date;
}

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
      createdAt?: Date;
    }
  ): Promise<void> {
    try {
      const userRef = doc(this.db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        fullName: additionalData.username,
        language: additionalData.language ?? null,
        phone: additionalData.phone ?? null,
        role: additionalData.role ?? "user",
        theme: additionalData.theme ?? "light",
        createdAt: additionalData.createdAt ?? new Date(),
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw new Error("Failed to create user profile");
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(this.db, "users", userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        return {
          uid: userId,
          ...docSnap.data(),
        } as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw new Error("Failed to get user profile");
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const usersCollection = collection(this.db, "users");
      const querySnapshot = await getDocs(usersCollection);

      // Map through documents and resolve role references
      const usersPromises = querySnapshot.docs.map(async (docSnap) => {
        const userData = docSnap.data();

        // If role exists and is a DocumentReference, resolve it
        if (userData.role && userData.role instanceof DocumentReference) {
          const roleSnapshot = await getDoc(userData.role);
          userData.role = roleSnapshot.data();
        }

        return {
          uid: docSnap.id,
          ...userData,
        } as UserProfile;
      });

      // Wait for all role resolutions to complete
      return await Promise.all(usersPromises);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async getRoles(): Promise<string[]> {
    try {
      const rolesCollection = collection(this.db, "roles");
      const querySnapshot = await getDocs(rolesCollection);

      return querySnapshot.docs.map((docSnap) => docSnap.id);
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Failed to fetch roles");
    }
  }
}

export default UserService;
