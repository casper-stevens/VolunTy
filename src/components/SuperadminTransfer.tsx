"use client";

import { useEffect, useState } from "react";
import { Crown, ChevronDown, AlertCircle } from "lucide-react";

export default function SuperadminTransfer() {
  const [admins, setAdmins] = useState<Array<{ id: string; full_name: string; role: string; email: string }>>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user from auth
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const { user } = await authRes.json();
        setCurrentUserId(user.id);
      }

      // Get all admins
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const users = await usersRes.json();
        const filteredAdmins = users.filter((u: any) =>
          ["admin", "super_admin"].includes(u.role)
        );
        setAdmins(filteredAdmins);

        // Find current user's role
        const currentUser = filteredAdmins.find((u: any) => u.id === currentUserId);
        if (currentUser) {
          setCurrentUserRole(currentUser.role);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedAdminId) {
      setError("Please select a recipient");
      return;
    }

    if (selectedAdminId === currentUserId) {
      setError("You are already super_admin");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure? This will transfer superadmin rights and you will become a regular admin."
    );
    if (!confirmed) return;

    setTransferring(true);
    setError(null);
    setSuccess(false);

    try {
      // First, demote current user to admin
      const demoteRes = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentUserId, role: "admin" }),
      });

      if (!demoteRes.ok) {
        throw new Error("Failed to demote current user");
      }

      // Then, promote selected admin to super_admin
      const promoteRes = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAdminId, role: "super_admin" }),
      });

      if (!promoteRes.ok) {
        throw new Error("Failed to promote new super_admin");
      }

      setSuccess(true);
      setSelectedAdminId("");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);
    } catch (e: any) {
      setError(e.message || "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  // Only show if current user is super_admin
  if (currentUserRole !== "super_admin") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <details className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
        <summary className="cursor-pointer p-4 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-900 dark:text-white">
          <Crown className="h-5 w-5 text-amber-600" />
          Superadmin Options
          <ChevronDown className="h-4 w-4" />
        </summary>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3 min-w-[300px]">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Transfer Superadmin to
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              disabled={loading || transferring}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
            >
              <option value="">Select an admin...</option>
              {admins
                .filter((a) => a.role === "admin")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name} ({a.email})
                  </option>
                ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-3">
              <p className="text-xs text-green-700 dark:text-green-200">Transfer successful! Redirecting...</p>
            </div>
          )}

          <button
            onClick={handleTransfer}
            disabled={!selectedAdminId || loading || transferring || success}
            className="w-full px-3 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {transferring ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </details>
    </div>
  );
}
