"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Clock, ChevronRight, Search, Shield, AlertCircle } from "lucide-react";

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  role: string;
  assignment_count: number;
  last_active: string | null;
}

interface VolunteerDetail extends Volunteer {
  phone_number: string | null;
  upcoming: Array<{
    id: string;
    status: string;
    created_at: string;
    role_name: string;
    start_time: string;
    end_time: string;
    event_title: string;
    event_id: string;
  }>;
  past: Array<{
    id: string;
    status: string;
    created_at: string;
    role_name: string;
    start_time: string;
    end_time: string;
    event_title: string;
    event_id: string;
  }>;
}

export default function AdminVolunteersList() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [showPastShifts, setShowPastShifts] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadVolunteers();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUserRole(data.user?.role);
      }
    } catch (e) {
      console.error("Failed to load current user", e);
    }
  };

  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/volunteers");
      if (res.ok) {
        const data = await res.json();
        setVolunteers(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteerDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedVolunteer(data);
        setShowDetail(true);
      }
    } catch (e) {
      console.error("Failed to load volunteer detail", e);
    }
  };

  const filtered = volunteers.filter(
    (v) =>
      v.full_name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase())
  );

  const handlePromote = async (id: string) => {
    if (!confirm("Promote this volunteer to admin role?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote" }),
      });
      if (res.ok) {
        alert("Volunteer promoted to admin");
        loadVolunteerDetail(id);
        loadVolunteers();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAccount = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s account? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      if (res.ok) {
        alert("Account deleted");
        setShowDetail(false);
        loadVolunteers();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Volunteers</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No volunteers found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Assignments</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Last Active</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filtered.map((volunteer) => (
                  <tr
                    key={volunteer.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => loadVolunteerDetail(volunteer.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{volunteer.full_name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{volunteer.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 text-xs font-medium">
                        {volunteer.assignment_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {volunteer.last_active
                        ? new Date(volunteer.last_active).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedVolunteer.full_name}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedVolunteer.email}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Phone</p>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">
                    {selectedVolunteer.phone_number || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Role</p>
                  <p className="text-sm text-slate-900 dark:text-white mt-1 capitalize">
                    {selectedVolunteer.role}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Total Assignments</p>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">
                    {selectedVolunteer.upcoming.length + selectedVolunteer.past.length}
                  </p>
                </div>
              </div>

              {/* Upcoming Shifts */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming Shifts
                </h3>
                {selectedVolunteer.upcoming.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">No upcoming shifts.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedVolunteer.upcoming.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg border border-blue-200 dark:border-blue-800 p-3 bg-blue-50 dark:bg-blue-900/20"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {a.event_title}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {a.role_name} • {new Date(a.start_time).toLocaleDateString()} at{" "}
                              {new Date(a.start_time).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Shifts Toggle */}
              {selectedVolunteer.past.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowPastShifts(!showPastShifts)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {showPastShifts ? "Hide" : "Show"} {selectedVolunteer.past.length} past shift
                    {selectedVolunteer.past.length !== 1 ? "s" : ""}
                  </button>
                  {showPastShifts && (
                    <div className="space-y-2 mt-3">
                      {selectedVolunteer.past.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {a.event_title}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {a.role_name} • {new Date(a.start_time).toLocaleDateString()} at{" "}
                                {new Date(a.start_time).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                              {a.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              {/* Action Buttons */}
              <div className="flex gap-2">
                {selectedVolunteer.role === "volunteer" && (
                  <button
                    onClick={() => handlePromote(selectedVolunteer.id)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Promote to Admin
                  </button>
                )}
                {selectedVolunteer.role === "volunteer" && (
                  <button
                    onClick={() => handleRemoveAccount(selectedVolunteer.id, selectedVolunteer.full_name)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Remove Account
                  </button>
                )}
                {selectedVolunteer.role !== "volunteer" && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">
                    Manager accounts cannot be modified or deleted from here.
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
