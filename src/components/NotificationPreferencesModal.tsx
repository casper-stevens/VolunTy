"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const COMMON_PRESETS = [
  { label: "15 minutes", minutes: 15 },
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "24 hours", minutes: 1440 },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Australia/Sydney",
];

function ModalContent({ onClose }: { onClose?: () => void }) {
  const [reminderMinutes, setReminderMinutes] = useState(1440);
  const [timezone, setTimezone] = useState("UTC");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/volunteer/notification-preferences");
      if (!response.ok) throw new Error("Failed to load preferences");
      
      const data = await response.json();
      setReminderMinutes(data.reminder_minutes_before || 1440);
      setTimezone(data.timezone || "UTC");
      setEnabled(data.enabled !== false);
    } catch (error) {
      console.error("Error loading preferences:", error);
      setMessage({ type: "error", text: "Failed to load preferences" });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/volunteer/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminder_minutes_before: reminderMinutes,
          timezone,
          enabled,
        }),
      });

      if (!response.ok) throw new Error("Failed to save preferences");

      setMessage({ type: "success", text: "Preferences saved!" });
      setTimeout(() => {
        setMessage(null);
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>

        {/* Enable/Disable Toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className="text-gray-700 font-medium">Enable notifications</span>
          </label>
        </div>

        {enabled && (
          <>
            {/* Reminder Minutes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Remind me before shift
              </label>

              {/* Preset buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {COMMON_PRESETS.map((preset) => (
                  <button
                    key={preset.minutes}
                    onClick={() => setReminderMinutes(preset.minutes)}
                    className={`py-2 px-3 rounded text-sm font-medium transition ${
                      reminderMinutes === preset.minutes
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10080"
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-600 text-sm">minutes</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Max 10,080 minutes (7 days). Custom values override presets.
              </p>
            </div>

            {/* Timezone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Ensures notifications arrive at the right time for you.
              </p>
            </div>
          </>
        )}

        {/* Messages */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationPreferencesModal({ onClose }: { onClose?: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<ModalContent onClose={onClose} />, document.body);
}
