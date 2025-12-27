/**
 * Push Notification Utilities
 * Handles browser push notification permissions and registration
 */

// Check if the browser supports push notifications
export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

// Check if running on Apple device (iOS/Safari)
export function isAppleDevice(): boolean {
  if (typeof window === "undefined") return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod|mac/.test(userAgent);
}

// Request push notification permission from the user
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported in this browser");
  }

  // Check current permission status first
  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    throw new Error("Push notifications have been blocked by the user");
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    throw error;
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    if (!isPushNotificationSupported()) {
      throw new Error("Push notifications are not supported");
    }

    // First, request permission
    const permission = await requestPushPermission();

    if (permission !== "granted") {
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Get or create push subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // You would normally get this from your backend
      // For now, we'll use a placeholder - in production this should come from your server
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.warn("VAPID public key not configured");
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
    }

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    throw error;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    throw error;
  }
}

// Get current push subscription
export async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    if (!isPushNotificationSupported()) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("Error getting push subscription:", error);
    return null;
  }
}

// Helper function to convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Send subscription to backend to be stored
export async function sendSubscriptionToBackend(
  subscription: PushSubscription | null,
  enabled: boolean
): Promise<void> {
  try {
    const response = await fetch("/api/volunteer/push-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription?.toJSON() || null,
        enabled,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save subscription to backend");
    }
  } catch (error) {
    console.error("Error sending subscription to backend:", error);
    throw error;
  }
}

// Check if user has enabled push notifications previously
export async function hasPushSubscription(): Promise<boolean> {
  try {
    const subscription = await getPushSubscription();
    return subscription !== null && Notification.permission === "granted";
  } catch (error) {
    console.error("Error checking push subscription:", error);
    return false;
  }
}

