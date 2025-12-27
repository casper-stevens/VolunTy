"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import SuperadminTransfer from "@/components/SuperadminTransfer";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const timezones = [
  { value: "Europe/Brussels", label: "Europe/Brussels (Belgium)" },
  { value: "Europe/Amsterdam", label: "Europe/Amsterdam (Netherlands)" },
  { value: "Europe/Paris", label: "Europe/Paris (France)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (Germany)" },
  { value: "Europe/London", label: "Europe/London (UK)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  { value: "America/Chicago", label: "America/Chicago (CST)" },
  { value: "UTC", label: "UTC" },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState("Europe/Brussels");
  const supabase = useMemo(() => createClient(), []);

  // Organization settings
  const [orgName, setOrgName] = useState<string>("");
  const [orgLogoUrl, setOrgLogoUrl] = useState<string>("");
  const [allowSelfSignup, setAllowSelfSignup] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [reminderHours, setReminderHours] = useState<number>(24);

  // User preferences
  const [prefLoading, setPrefLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [darkModePref, setDarkModePref] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadUserPreferences();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setTimezone(data.timezone || "Europe/Brussels");
        setOrgName(data.organization_name || "");
        setOrgLogoUrl(data.organization_logo_url || "");
        setAllowSelfSignup((data.allow_self_signup ?? "true") === "true");
        setNotificationsEnabled((data.notifications_enabled ?? "true") === "true");
        const hours = parseInt(data.reminder_hours_before_shift ?? "24", 10);
        setReminderHours(Number.isNaN(hours) ? 24 : hours);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimezone = async (value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "timezone", value }),
      });
      
      if (!res.ok) throw new Error("Failed to save");
      
      setTimezone(value);
    } catch (error) {
      console.error("Failed to save setting:", error);
      alert("Failed to save setting");
    } finally {
      setSaving(false);
    }
  };

  const saveSetting = async (key: string, value: string | boolean | number) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: String(value) }),
      });
      if (!res.ok) throw new Error("Failed to save setting");
    } catch (e) {
      console.error("Failed to save setting:", e);
      alert("Failed to save setting");
    } finally {
      setSaving(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        console.error("Error getting user:", userErr.message);
        setPrefLoading(false);
        return;
      }
      const uid = userData.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setPrefLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_preferences")
        .select("dark_mode, email_notifications")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) {
        console.error("Error loading preferences:", error.message);
      }
      setDarkModePref(Boolean(data?.dark_mode ?? false));
      setEmailNotifications(Boolean(data?.email_notifications ?? true));
    } catch (e) {
      console.error("Exception loading preferences:", e);
    } finally {
      setPrefLoading(false);
    }
  };

  const saveUserPreferences = async (prefs: { dark_mode?: boolean; email_notifications?: boolean }) => {
    if (!userId) return;
    setPrefLoading(true);
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          dark_mode: prefs.dark_mode ?? darkModePref,
          email_notifications: prefs.email_notifications ?? emailNotifications,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      if (prefs.dark_mode !== undefined) setDarkModePref(prefs.dark_mode);
      if (prefs.email_notifications !== undefined) setEmailNotifications(prefs.email_notifications);
    } catch (e: any) {
      console.error("Failed to save preferences:", e.message ?? e);
      alert("Failed to save preferences");
    } finally {
      setPrefLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500">
              Configure organization-wide settings and preferences.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Timezone</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Set the default timezone for all events and schedules. This affects how dates and times are displayed throughout the application.
                  </p>
                </div>
                <div className="w-72">
                  <select
                    value={timezone}
                    onChange={(e) => updateTimezone(e.target.value)}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-900 disabled:opacity-50"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Name */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Organization Name</h3>
                  <p className="text-sm text-slate-500 mt-1">Displayed across the app and in emails.</p>
                </div>
                <div className="w-72">
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    onBlur={() => saveSetting("organization_name", orgName)}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 disabled:opacity-50"
                    placeholder="VolunTy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organization Logo URL */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Logo URL</h3>
                  <p className="text-sm text-slate-500 mt-1">Public URL to your organization logo.</p>
                </div>
                <div className="w-72">
                  <input
                    type="url"
                    value={orgLogoUrl}
                    onChange={(e) => setOrgLogoUrl(e.target.value)}
                    onBlur={() => saveSetting("organization_logo_url", orgLogoUrl)}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 disabled:opacity-50"
                    placeholder="https://.../logo.png"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Allow Self Signup */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Allow Self Signup</h3>
                  <p className="text-sm text-slate-500 mt-1">Permit volunteers to sign up without an invite.</p>
                </div>
                <div className="w-72">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allowSelfSignup}
                      onChange={(e) => {
                        setAllowSelfSignup(e.target.checked);
                        saveSetting("allow_self_signup", e.target.checked);
                      }}
                      disabled={saving}
                    />
                    <span className="text-sm text-slate-700">Enabled</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Enabled */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Email Notifications</h3>
                  <p className="text-sm text-slate-500 mt-1">Enable global email notifications (reminders, alerts).</p>
                </div>
                <div className="w-72">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => {
                        setNotificationsEnabled(e.target.checked);
                        saveSetting("notifications_enabled", e.target.checked);
                      }}
                      disabled={saving}
                    />
                    <span className="text-sm text-slate-700">Enabled</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder Hours Before Shift */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Reminder Timing</h3>
                  <p className="text-sm text-slate-500 mt-1">Hours before a shift to send reminders.</p>
                </div>
                <div className="w-72">
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={reminderHours}
                    onChange={(e) => setReminderHours(parseInt(e.target.value || "24", 10))}
                    onBlur={() => saveSetting("reminder_hours_before_shift", reminderHours)}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Your Preferences</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage your personal notification and theme preferences.</p>
                </div>
                <div className="w-72 space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => saveUserPreferences({ email_notifications: e.target.checked })}
                      disabled={prefLoading}
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Dark Mode (preference)</span>
                    <input
                      type="checkbox"
                      checked={darkModePref}
                      onChange={(e) => saveUserPreferences({ dark_mode: e.target.checked })}
                      disabled={prefLoading}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {saving && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          )}
        </div>
      </div>
      {/* Superadmin-only floating control; component self-gates by role */}
      <SuperadminTransfer />
    </AdminLayout>
  );
}
