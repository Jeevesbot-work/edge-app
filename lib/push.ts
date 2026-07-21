// Client-side Web Push helpers: register the service worker, ask permission,
// subscribe with our VAPID public key, and persist the subscription server-side.

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

/**
 * Full opt-in: register SW -> request permission -> subscribe -> save.
 * Returns "subscribed" | "denied" | "unsupported" | "error".
 * Must be called from a user gesture (button click) so the permission prompt fires.
 */
export async function enableProteinPacePush(): Promise<
  "subscribed" | "denied" | "unsupported" | "error"
> {
  if (!pushSupported() || !VAPID_PUBLIC_KEY) return "unsupported";

  try {
    const registration = await getRegistration();

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    // Reuse an existing subscription if present, else create one.
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // Cast: the DOM lib types applicationServerKey as BufferSource; our
        // Uint8Array satisfies it at runtime.
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });
    if (!res.ok) return "error";

    return "subscribed";
  } catch (err) {
    console.error("[push] enable failed:", err);
    return "error";
  }
}

// Local flag so we don't re-prompt someone who already opted in or dismissed
// on this device. Permission state itself is the source of truth for "granted".
const DISMISS_KEY = "protein_pace_push_dismissed";

export function alreadyHandledPush(): boolean {
  if (!pushSupported()) return true;
  if (Notification.permission === "granted" || Notification.permission === "denied") return true;
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissPushPrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}
