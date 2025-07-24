import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

type Operator = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  companyId: string;
};

export function useOperators(adminId?: string) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOperators = async () => {
      if (!adminId) {
        console.log("No adminId provided");
        setOperators([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching operators for adminId:", adminId);

        // First, get the company ID from towing_companies collection
        const companiesQuery = query(
          collection(db, "towing_companies"),
          where("adminId", "==", adminId)
        );
        const companiesSnapshot = await getDocs(companiesQuery);

        console.log("Companies found:", companiesSnapshot.docs.length);

        if (companiesSnapshot.empty) {
          console.log("No company found for adminId:", adminId);
          // Let's try a different approach - maybe the structure is different
          // Try using adminId directly as companyId
          const directOperatorsQuery = query(
            collection(db, "users"),
            where("companyId", "==", adminId),
            where("role", "==", "tow_operator")
          );

          const directOperatorsSnapshot = await getDocs(directOperatorsQuery);
          console.log(
            "Direct operators found:",
            directOperatorsSnapshot.docs.length
          );

          const operatorsData = directOperatorsSnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Operator data:", data);
            return {
              id: doc.id,
              ...data,
            };
          }) as Operator[];

          setOperators(operatorsData);
          setLoading(false);
          return;
        }

        // Get the company ID (assuming one company per admin)
        const companyDoc = companiesSnapshot.docs[0];
        const companyId = companyDoc.id;
        console.log("Found companyId:", companyId);

        // Now fetch operators from users collection where companyId matches
        const operatorsQuery = query(
          collection(db, "users"),
          where("companyId", "==", companyId),
          where("role", "==", "tow_operator")
        );

        const operatorsSnapshot = await getDocs(operatorsQuery);
        console.log("Operators found:", operatorsSnapshot.docs.length);

        const operatorsData = operatorsSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Operator data:", data);
          return {
            id: doc.id,
            ...data,
          };
        }) as Operator[];

        setOperators(operatorsData);
      } catch (err) {
        console.error("Error loading operators:", err);
        setError("Failed to load operators");
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, [adminId]);

  return { operators, loading, error };
}
