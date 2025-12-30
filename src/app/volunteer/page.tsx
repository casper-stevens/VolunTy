"use client";

import VolunteerShiftList from "@/components/VolunteerShiftList";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Calendar, Link as LinkIcon, Copy, X } from "lucide-react";

export default function VolunteerPortal() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"my-shifts" | "open-shifts" | "settings">("my-shifts");
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (user && activeTab === "settings") {
      loadCalendarToken();
    }
  }, [user, activeTab]);

  const loadCalendarToken = async () => {
    try {
      const res = await fetch("/api/volunteer/assignments/token");
      if (res.ok) {
        const data = await res.json();
        setCalendarToken(data.token);
      }
    } catch (error) {
      console.error("Failed to load calendar token:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const calendarUrl = calendarToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/volunteer/calendar?token=${calendarToken}`
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Login Required</h2>
            <p className="text-slate-600 mb-6">
              Please log in to view volunteer opportunities and manage your shifts.
            </p>
            <Link
              href="/login?redirectTo=/volunteer"
              className="inline-block w-full bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Volunteer Portal</h1>
          <p className="text-slate-500 mt-2">
            Find your next opportunity or manage your existing shifts.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("my-shifts")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "my-shifts"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            My Shifts
          </button>
          <button
            onClick={() => setActiveTab("open-shifts")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "open-shifts"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Open Shifts
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "settings" ? (
          <div className="space-y-8">
            {/* Push Notifications */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Notifications</h2>
              <PushNotificationToggle />
            </div>

            {/* Calendar Feed */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Calendar Integration</h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Subscribe to Your Shifts
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Add your volunteer shifts to your calendar app (Google Calendar, Apple Calendar,
                      Outlook, etc.). Your calendar will automatically update when shifts change.
                    </p>
                    <button
                      onClick={() => setShowCalendarModal(true)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Get Calendar Feed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <VolunteerShiftList activeTab={activeTab} />
        )}

        {/* Calendar Modal */}
        {showCalendarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Calendar Feed</h2>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Calendar Feed URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={calendarUrl || "Loading..."}
                      readOnly
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => calendarUrl && copyToClipboard(calendarUrl)}
                      disabled={!calendarUrl}
                      className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {copyFeedback ? <Copy className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copyFeedback ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This is your personal calendar feed URL. Don't share it with others.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">How to Add to Your Calendar</h3>
                  
                  <div className="space-y-4 text-sm text-blue-800">
                    <div>
                      <p className="font-semibold mb-1">📅 Google Calendar:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open Google Calendar</li>
                        <li>Click the + next to "Other calendars"</li>
                        <li>Select "From URL"</li>
                        <li>Paste the URL above and click "Add calendar"</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-semibold mb-1">🍎 Apple Calendar:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open Calendar app</li>
                        <li>Go to File → New Calendar Subscription</li>
                        <li>Paste the URL above</li>
                        <li>Choose update frequency and click Subscribe</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-semibold mb-1">📧 Outlook:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open Outlook Calendar</li>
                        <li>Click "Add calendar" → "Subscribe from web"</li>
                        <li>Paste the URL above</li>
                        <li>Name it and click Import</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Calendar apps typically update subscribed calendars every few
                    hours. Changes to your shifts may not appear immediately.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

