import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  getDoc,
  doc as firestoreDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export interface Claim {
  id: string;
  claimNumber: string;
  aiSuggestion?: string | null;
  assignedInsurerId?: string | null;
  assignedInsurerName?: string;
  category?: string;
  description?: string;
  images?: string[];
  location?: { lat: number; lng: number };
  status?: string;
  submittedAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  userId?: string;
  companyId?: string | null;
  fullName?: string;
  role?: string;
}

const normalizeRefId = (val: any): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if ("id" in val && typeof val.id === "string") return val.id;
    if ("path" in val && typeof val.path === "string") {
      const parts = val.path.split("/");
      return parts[parts.length - 1];
    }
  }
  return undefined;
};

export const useClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setLoading(true);

    const unsubAuth = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        console.log("useClaims: no authenticated user");
        setClaims([]);
        setLoading(false);
        return;
      }

      try {
        const currentUserSnap = await getDoc(
          firestoreDoc(db, "users", authUser.uid)
        );
        const currentUserRole = currentUserSnap.exists()
          ? (currentUserSnap.data() as any).role
          : null;

        // Real-time listener
        const unsubClaims = onSnapshot(
          collection(db, "claims"),
          async (snapshot) => {
            const raw = snapshot.docs.map((d) => {
              const data = d.data() as any;
              return {
                id: d.id,
                claimNumber: data.claimNumber ?? undefined,
                aiSuggestion: data.aiSuggestion ?? null,
                assignedInsurerId: data.assignedInsurerId ?? null,
                category: data.category ?? "",
                description: data.description ?? "",
                images: data.images ?? [],
                location: data.location ?? undefined,
                status: data.status ?? "",
                submittedAt: data.submittedAt ?? null,
                updatedAt: data.updatedAt ?? null,
                userId: normalizeRefId(data.userId),
                companyId: normalizeRefId(data.companyId) ?? null,
              } as Claim;
            });

            let visible = raw;
            if (currentUserRole === "super_admin") {
              console.log("useClaims: super_admin → show all claims");
            } else if (currentUserRole === "insurer") {
              visible = raw.filter(
                (c) => c.companyId && c.companyId === authUser.uid
              );
            } else {
              visible = raw.filter(
                (c) => c.userId && c.userId === authUser.uid
              );
            }

            // Fetch related user docs
            const allUserIds = Array.from(
              new Set([
                ...visible.map((c) => c.userId).filter(Boolean),
                ...visible.map((c) => c.assignedInsurerId).filter(Boolean),
              ])
            ) as string[];

            const userMap: Record<string, { fullName: string; role: string }> =
              {};
            await Promise.all(
              allUserIds.map(async (uid) => {
                try {
                  const snap = await getDoc(firestoreDoc(db, "users", uid));
                  if (snap.exists()) {
                    const data = snap.data() as any;
                    userMap[uid] = {
                      fullName: data.fullName ?? "Unknown User",
                      role: data.role ?? "unknown",
                    };
                  } else {
                    userMap[uid] = {
                      fullName: "Unknown User",
                      role: "unknown",
                    };
                  }
                } catch (err) {
                  console.warn(`useClaims: failed to fetch user ${uid}`, err);
                  userMap[uid] = {
                    fullName: "Unknown User",
                    role: "unknown",
                  };
                }
              })
            );

            const finalClaims: Claim[] = visible.map((c) => {
              const submittedDate =
                c.submittedAt && (c.submittedAt as Timestamp)?.toDate
                  ? (c.submittedAt as Timestamp).toDate()
                  : null;
              const datePart = submittedDate
                ? submittedDate.toISOString().slice(0, 10).replace(/-/g, "")
                : "NA";
              const shortId = c.id ? c.id.slice(0, 5) : "xxxxx";
              const claimNumber = c.claimNumber
                ? c.claimNumber
                : `C-${datePart}-${shortId}`;

              return {
                ...c,
                claimNumber,
                fullName: c.userId
                  ? userMap[c.userId]?.fullName ?? "Unknown User"
                  : "Unknown User",
                role: c.userId
                  ? userMap[c.userId]?.role ?? "unknown"
                  : "unknown",
                assignedInsurerName: c.assignedInsurerId
                  ? userMap[c.assignedInsurerId]?.fullName ?? "Unknown"
                  : "Not Assigned",
              };
            });

            setClaims(finalClaims);
            setLoading(false);
          },
          (err) => {
            console.error("useClaims: snapshot error:", err);
            setError(err.message);
            setLoading(false);
          }
        );

        return () => unsubClaims();
      } catch (err) {
        console.error("useClaims: error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch claims");
        setClaims([]);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  return { claims, loading, error };
};
