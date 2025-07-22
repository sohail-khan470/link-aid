// src/components/tables/UsersTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../common/ComponentCard";
import { useUsers } from "../../hooks/useUsers";

export default function UsersTable() {
  const { users, loading, error } = useUsers();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "civilian":
        return "info";
      case "insurer":
        return "warning";
      case "responder":
        return "primary";
      case "tow_operator":
        return "success";
      default:
        return ;
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading users...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <ComponentCard title="User Management">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 text-start py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Role
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400">
                  Registered
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                    {user.phoneNumber}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-start text-theme-sm">
                    <Badge size="sm" color={getRoleColor(user.role)}>
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                    {user.createdAtFormatted}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ComponentCard>
  );
}
