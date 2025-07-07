import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../../firebase";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { User } from "../types/user.type";
import PageMeta from "../../components/common/PageMeta";
import { FiEye, FiEyeOff, FiPlus, FiX, FiTrash2 } from "react-icons/fi";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const currentUser = auth.currentUser;

  const VITE_FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

  // New user form state
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "civilian",
  });

  // Fetch users from Firebase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError("Failed to update user role");
      console.error(err);
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    }
  };

  // Register new user without signing in
  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Create auth user using the Firebase REST API to avoid auto-signin
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${VITE_FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newUser.email,
            password: newUser.password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message || "Failed to register user");
      }

      // Create user document in Firestore
      await setDoc(doc(db, "users", data.localId), {
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isVerified: false,
        createdAt: new Date(),
      });

      // Refresh user list and reset form
      fetchUsers();
      setShowAddUserForm(false);
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "civilian",
      });
    } catch (err: any) {
      setError(err.message || "Failed to register user");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <PageMeta
        title="User Management"
        description="Manage application users"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <button
            onClick={() => setShowAddUserForm(!showAddUserForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {showAddUserForm ? (
              <>
                <FiX className="w-5 h-5" />
                Cancel
              </>
            ) : (
              <>
                <FiPlus className="w-5 h-5" />
                Add New User
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>
        )}

        {/* Add User Form */}
        {showAddUserForm && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Register New User
            </h2>
            <form onSubmit={registerUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="civilian">Civilian</option>
                  <option value="insurer">Insurer</option>
                  <option value="responder">Responder</option>
                  <option value="tow_operator">Tow Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              >
                Register User
              </button>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-gray-800 dark:text-gray-200">
                  S:No
                </th>
                <th className="px-6 py-3 text-left text-gray-800 dark:text-gray-200">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-gray-800 dark:text-gray-200">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-gray-800 dark:text-gray-200">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-gray-800 dark:text-gray-200">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-gray-800 dark:text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                    {user.phone || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      disabled={user.id === currentUser?.uid}
                      className="border rounded p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="civilian">Civilian</option>
                      <option value="insurer">Insurer</option>
                      <option value="responder">Responder</option>
                      <option value="tow_operator">Tow Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={user.id === currentUser?.uid}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400 dark:disabled:text-gray-500"
                    >
                      <FiTrash2 className="w-5 h-5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
