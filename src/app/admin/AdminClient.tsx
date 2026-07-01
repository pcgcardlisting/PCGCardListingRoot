"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  emailVerified: string | null;
  _count: { watchlist: number; pinnedCards: number; listings: number; messages: number };
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  activeListings: number;
  totalMessages: number;
}

export default function AdminClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleRole(user: AdminUser) {
    setUpdating(user.id);
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, role: newRole }),
    });
    setUpdating(null);
    fetchUsers();
  }

  async function deleteUser(user: AdminUser) {
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    setDeleteConfirm(null);
    fetchUsers();
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Nav */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-rose-400">🧶 Craft-A-Holic Mom</Link>
          <span className="bg-red-900/40 text-red-300 border border-red-800 text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Manage members, roles and site activity</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Members", value: stats.totalUsers, icon: "👥", color: "text-blue-400" },
              { label: "Admins", value: stats.totalAdmins, icon: "🛡️", color: "text-red-400" },
              { label: "Active Listings", value: stats.activeListings, icon: "🃏", color: "text-green-400" },
              { label: "Total Messages", value: stats.totalMessages, icon: "💬", color: "text-purple-400" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span>{s.icon}</span>
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white flex-1">Registered Members</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="bg-gray-800 border border-gray-700 rounded-xl pl-8 pr-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 w-56"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-xs text-gray-500 font-semibold">Member</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-semibold">Email</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-semibold">Role</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-semibold">Joined</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-semibold">Activity</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      {/* Avatar + name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-rose-900 flex items-center justify-center text-xs font-bold text-rose-300">
                              {(user.name || user.email)[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium text-xs">{user.name || "—"}</div>
                            {user.emailVerified && <div className="text-green-500 text-xs">✓ verified</div>}
                          </div>
                          {user.id === currentUserId && (
                            <span className="text-xs text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-4 py-3 text-gray-300 text-xs">{user.email}</td>
                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-red-900/40 text-red-300 border border-red-800"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                      {/* Activity */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span title="Watchlist">⭐ {user._count.watchlist}</span>
                          <span title="Listings">🃏 {user._count.listings}</span>
                          <span title="Messages">💬 {user._count.messages}</span>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleRole(user)}
                            disabled={updating === user.id || user.id === currentUserId}
                            className={`text-xs px-2 py-1 rounded-lg border transition-colors disabled:opacity-40 ${
                              user.role === "ADMIN"
                                ? "border-orange-700 text-orange-400 hover:bg-orange-900/20"
                                : "border-green-700 text-green-400 hover:bg-green-900/20"
                            }`}
                          >
                            {updating === user.id ? "..." : user.role === "ADMIN" ? "Demote" : "Make Admin"}
                          </button>
                          {user.id !== currentUserId && (
                            <button
                              onClick={() => setDeleteConfirm(user)}
                              className="text-xs px-2 py-1 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/20 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">No members found</div>
              )}
            </div>
          )}
        </div>

        {/* Email config reminder */}
        <div className="mt-6 bg-amber-900/20 border border-amber-800/40 rounded-xl p-4 text-sm text-amber-200">
          <strong>📧 Email notifications:</strong> To receive new member emails, set{" "}
          <code className="bg-amber-900/30 px-1 rounded text-xs">GMAIL_USER</code>,{" "}
          <code className="bg-amber-900/30 px-1 rounded text-xs">GMAIL_APP_PASSWORD</code>, and{" "}
          <code className="bg-amber-900/30 px-1 rounded text-xs">ADMIN_EMAIL</code> in your Vercel environment variables.
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold mb-2">Delete Member?</h3>
            <p className="text-gray-400 text-sm mb-1">
              This will permanently delete <strong className="text-white">{deleteConfirm.name || deleteConfirm.email}</strong> and all their data.
            </p>
            <p className="text-red-400 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">Cancel</button>
              <button onClick={() => deleteUser(deleteConfirm)} className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
