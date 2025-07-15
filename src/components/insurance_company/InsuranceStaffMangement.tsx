import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  insurerId: string;
}

export default function InsuranceStaffMangement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "claims_agent",
  });
  const [loading, setLoading] = useState(true);
  const [insurerId, setInsurerId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const q = query(
        collection(db, "insurers"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setInsurerId(doc.id);
        fetchStaff(doc.id);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStaff = async (insurerId: string) => {
    setLoading(true);
    const q = query(
      collection(db, "insurer_staff"),
      where("insurerId", "==", insurerId)
    );
    const snapshot = await getDocs(q);
    const staff = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Staff)
    );
    setStaffList(staff);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!insurerId) return;
    const newDoc = await addDoc(collection(db, "insurer_staff"), {
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone,
      role: newStaff.role,
      insurerId,
    });
    setNewStaff({ name: "", email: "", phone: "", role: "claims_agent" });
    fetchStaff(insurerId);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "insurer_staff", id));
    if (insurerId) fetchStaff(insurerId);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Insurance Staff</h1>

      <div className="bg-white p-4 shadow rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Staff Member</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            name="name"
            value={newStaff.name}
            onChange={handleChange}
            placeholder="Name"
            className="border p-2 rounded"
          />
          <input
            name="email"
            value={newStaff.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded"
          />
          <input
            name="phone"
            value={newStaff.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="border p-2 rounded"
          />
          <select
            name="role"
            value={newStaff.role}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="claims_agent">Claims Agent</option>
            <option value="manager">Manager</option>
          </select>
          <button
            onClick={handleAdd}
            className="col-span-full bg-blue-600 text-white rounded py-2 mt-2 hover:bg-blue-700"
          >
            Add Staff
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-2">Staff List</h2>
          <ul>
            {staffList.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>
                  {user.name} ({user.role}) – {user.email}
                </span>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
