"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, HelpCircle, X } from "lucide-react";

export default function AdminSwapRequests() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [actioning, setActioning] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [reqRes, usersRes] = await Promise.all([
        fetch("/api/admin/swap-requests"),
        fetch("/api/admin/users"),
      ]);

      if (reqRes.ok) {
        const data = await reqRes.json();
        setItems(data);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const volunteerOptions = useMemo(
    () => users.filter((u) => u.role === "volunteer"),
    [users]
  );

  const doAction = async (
    requestId: string,
    action: "accept" | "decline" | "cancel"
  ) => {
    try {
      setActioning(requestId + ":" + action);
      const body: any = { id: requestId, action };
      if (action === "accept") {
        const userId = selected[requestId];
        if (!userId) return;
        body.accepted_by_id = userId;
      }
      const res = await fetch("/api/admin/swap-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Action failed");
        return;
      }
      // Refresh list
      const refreshed = await fetch("/api/admin/swap-requests");
      if (refreshed.ok) setItems(await refreshed.json());
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">Loading swap requests...</div>;
  }

  if (!items.length) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">No pending swap requests.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pending Swap Requests</h3>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </button>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">How admin actions work</h4>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Accept:</span>
                <span className="ml-1">Assigns the selected volunteer to the requester’s shift and closes the request.</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Decline:</span>
                <span className="ml-1">Closes the request. The requester keeps their assignment; their status returns to confirmed.</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Cancel:</span>
                <span className="ml-1">Frees the requester from the shift by removing their assignment (increases availability). Admin-only.</span>
              </div>
              <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 text-amber-900 dark:text-amber-200">
                Tip: Ensure you pick a volunteer before Accept. Cancel is irreversible and will remove the requester from the roster for this sub-shift.
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full rounded-lg bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.event_title || "Event"}</p>
              <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Role: {r.role_name}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Time: {r.start_time?.slice(11, 16)} - {r.end_time?.slice(11, 16)}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              Requested by {r.requester_name} ({r.requester_email || "no email"})
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 w-24">Assign to</label>
                <select
                  className="flex-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                  value={selected[r.id] || ""}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, [r.id]: e.target.value }))
                  }
                >
                  <option value="">Select volunteer…</option>
                  {volunteerOptions
                    .filter((u) => u.email)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.email} ({u.email})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  className="inline-flex items-center rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 disabled:opacity-50"
                  disabled={!selected[r.id] || actioning === r.id + ":accept"}
                  onClick={() => doAction(r.id, "accept")}
                >
                  {actioning === r.id + ":accept" ? "Accepting…" : "Accept"}
                </button>
                <button
                  className="inline-flex items-center rounded bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1 disabled:opacity-50"
                  disabled={actioning === r.id + ":decline"}
                  onClick={() => doAction(r.id, "decline")}
                >
                  {actioning === r.id + ":decline" ? "Declining…" : "Decline"}
                </button>
                <button
                  className="inline-flex items-center rounded bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1 disabled:opacity-50 ml-auto"
                  disabled={actioning === r.id + ":cancel"}
                  onClick={() => doAction(r.id, "cancel")}
                >
                  {actioning === r.id + ":cancel" ? "Cancelling…" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
