"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import {
  Users,
  Search,
  RefreshCw,
  Trash2,
  Shield,
  User as UserIcon,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, role, isLoading: isAuthLoading } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Deletion modal state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthLoading, isAuthenticated, role, router]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.users.getAll();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (e: any) {
      error("Error", "Failed to retrieve user directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "admin") {
      loadUsers();
    }
  }, [isAuthenticated, role]);

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    if (currentUser?.id === deletingUser.id) {
      error("Action Forbidden", "You cannot delete your own active administrator account.");
      setDeletingUser(null);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await api.users.delete(deletingUser.id);
      if (res.success) {
        success("User Deleted", `${deletingUser.name} has been removed.`);
        setDeletingUser(null);
        loadUsers();
      } else {
        error(
          "Cannot Delete User",
          res.message || res.errors || "User has active bookings or cannot be removed."
        );
      }
    } catch (err: any) {
      error("Delete Error", err?.message || "Server error while deleting user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
        );
      }
      return true;
    });
  }, [users, roleFilter, search]);

  if (isAuthLoading || (isAuthenticated && role !== "admin")) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            Admin Console
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            User Accounts Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect all registered customers and administrators across the vehicle rental platform.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadUsers}
          isLoading={isLoading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Directory
        </Button>
      </div>

      <AdminNav />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Administrators</option>
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {filteredUsers.length} of {users.length}
          </span>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Loading user directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Users className="w-10 h-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-white">No users found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No registered accounts matched your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">User ID #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">{u.email}</td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        {u.phone || "—"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-md border ${
                            u.role === "admin"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Delete User Account?"
        description="Are you sure you want to delete this user? Note: Users with active vehicle reservations cannot be deleted."
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          {deletingUser && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col gap-1">
              <strong className="text-white">{deletingUser.name}</strong>
              <span className="text-slate-400">{deletingUser.email}</span>
              <span className="text-slate-400">Role: {deletingUser.role}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
