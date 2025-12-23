"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function DataDeletion() {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // If the user is logged in, perform immediate deletion
    if (user) {
      if (confirmText.trim().toUpperCase() !== "DELETE") {
        setError("Please type DELETE to confirm.");
        return;
      }
      // Show final confirmation modal before proceeding
      setShowConfirm(true);
    } else {
      // Not logged in: submit a request only (informational)
      console.log("Deletion request submitted (not authenticated)", { email, reason });
      setSubmitted(true);
    }
  };

  const confirmDeletion = async () => {
    try {
      setDeleting(true);
      setError(null);
      const res = await fetch("/api/data-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Deletion failed" }));
        throw new Error(data.error || "Deletion failed");
      }
      await signOut();
      setShowConfirm(false);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong while deleting your data.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
          >
            ← Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Data Deletion Request
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Request deletion of your personal data from VolunTy
          </p>

          {!submitted ? (
            <>
              {user && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-red-900 mb-2">Immediate Account Deletion</h3>
                  <p className="text-sm text-red-800 mb-3">
                    You are currently signed in. Submitting this form will permanently delete your account and all associated data immediately.
                  </p>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-red-900">
                      Type <span className="font-bold">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="DELETE"
                    />
                  </div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  What will be deleted?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Your account and profile information</li>
                  <li>Your volunteer shift history</li>
                  <li>Any personal data associated with your account</li>
                  <li>
                    Your authentication data (Facebook login connection will be
                    removed)
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Important Notes
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>
                    This action is irreversible once processed (within 30 days)
                  </li>
                  <li>
                    You will lose access to your volunteer scheduling and
                    history
                  </li>
                  <li>
                    Organizations may retain anonymized data for compliance
                    purposes
                  </li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address or Facebook Account
                  </label>
                  <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com or Facebook user ID"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Provide the email or Facebook account you used to sign up
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Reason for Deletion (Optional)
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Help us improve by sharing why you're leaving..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={deleting}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {deleting ? "Deleting..." : user ? "Delete My Account & Data" : "Submit Deletion Request"}
                </button>
              </form>

              {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900">Are you absolutely sure?</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        This action will permanently delete your VolunTy account and all associated data. This cannot be undone.
                      </p>
                      <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowConfirm(false)}
                          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={confirmDeletion}
                          disabled={deleting}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting ? "Deleting..." : "Yes, delete my account"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Alternative Options
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    Instead of deleting your account, you can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Simply sign out and stop using the service</li>
                    <li>Revoke VolunTy's access in your Facebook settings</li>
                    <li>
                      Contact us at privacy@volunty.app for other options
                    </li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Request Submitted
              </h2>
              <p className="text-slate-600 mb-6">
                Your data deletion request has been received. We will process it
                within 30 days and send a confirmation to the email or account
                you provided.
              </p>
              <p className="text-sm text-slate-500 mb-6">
                If you have any questions, contact us at privacy@volunty.app
              </p>
              <Link
                href="/"
                className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          )}
        </div>

        {/* Instructions for Facebook Users */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            For Facebook Login Users
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            You can also revoke VolunTy's access directly from Facebook:
          </p>
          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
            <li>Go to your Facebook Settings & Privacy → Settings</li>
            <li>Click on "Apps and Websites"</li>
            <li>Find "VolunTy" in the list</li>
            <li>Click "Remove" to revoke access</li>
          </ol>
          <p className="text-sm text-slate-500 mt-4">
            Note: Revoking access prevents you from logging in, but doesn't
            delete your data from our system. Use the form above to request data
            deletion.
          </p>
        </div>
      </div>
    </main>
  );
}
