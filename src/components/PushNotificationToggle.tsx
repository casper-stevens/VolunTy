"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  isPushNotificationSupported,
  isAppleDevice,
  hasPushSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendSubscriptionToBackend,
} from "@/lib/pushNotifications";

export default function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isApple, setIsApple] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAppleGuide, setShowAppleGuide] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check browser support and current subscription status
    setIsSupported(isPushNotificationSupported());
    setIsApple(isAppleDevice());

    const checkSubscription = async () => {
      try {
        const hasSubscription = await hasPushSubscription();
        setHasSubscription(hasSubscription);
      } catch (err) {
        console.error("Error checking subscription:", err);
      }
    };

    checkSubscription();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (hasSubscription) {
        // Disable notifications
        await unsubscribeFromPushNotifications();
        await sendSubscriptionToBackend(null, false);
        setHasSubscription(false);
      } else {
        // Enable notifications
        const subscription = await subscribeToPushNotifications();
        if (subscription) {
          await sendSubscriptionToBackend(subscription, true);
          setHasSubscription(true);
        } else {
          setError("Failed to subscribe to notifications. Please try again.");
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update notification settings";
      setError(errorMessage);
      console.error("Notification toggle error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  if (!isSupported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Push notifications not supported
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main toggle card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {hasSubscription ? (
              <div className="p-3 bg-green-100 rounded-lg">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-lg">
                <BellOff className="w-6 h-6 text-slate-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Push Notifications
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {hasSubscription
                  ? "You'll receive notifications about your shifts"
                  : "Enable to get alerts about shift changes and reminders"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              hasSubscription
                ? "bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-red-100 disabled:opacity-50"
                : "bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-green-100 disabled:opacity-50"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {hasSubscription ? "Disable" : "Enable"}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Apple-specific guidance */}
      {isApple && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <button
            onClick={() => setShowAppleGuide(!showAppleGuide)}
            className="flex items-center gap-3 w-full text-left hover:bg-blue-100 p-2 rounded transition-colors"
          >
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Apple device? Here's what to do
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                {showAppleGuide ? "Click to hide" : "Click to show"}
              </p>
            </div>
          </button>

          {showAppleGuide && (
            <div className="mt-4 pl-8 space-y-3 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-1">📱 iPhone / iPad:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>When prompted, tap "Allow" to enable notifications</li>
                  <li>Go to Settings → Notifications</li>
                  <li>Find this app and enable notifications</li>
                  <li>
                    Note: Web push notifications on iOS Safari are limited.
                    Consider using the native app if available.
                  </li>
                </ol>
              </div>

              <div>
                <p className="font-semibold mb-1">🖥️ Mac:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>When prompted, click "Allow"</li>
                  <li>
                    Go to System Settings → Notifications → Web notifications
                  </li>
                  <li>Make sure this website is allowed</li>
                </ol>
              </div>

              <div className="bg-blue-100 rounded p-2 mt-2">
                <p className="text-xs">
                  ✓ Notifications will appear in your Notification Center just
                  like app notifications
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* General info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">What you'll get:</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>Shift reminders 24 hours before your shifts</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>Swap request updates</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>Event cancellations and changes</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>Open shift opportunities</span>
          </li>
        </ul>
        <p className="text-xs text-slate-500 mt-3">
          You can enable or disable notifications at any time. Your notification preferences are saved automatically.
        </p>
      </div>
    </div>
  );
}
