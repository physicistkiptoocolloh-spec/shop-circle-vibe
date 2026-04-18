// FCM web push registration. The VAPID key is a PUBLIC key — safe to ship in client.
import { supabase } from "@/integrations/supabase/client";

const VAPID_KEY =
  "BIgIKhfNKtDCMc2i4QJSNw66rNEeXzjKDOpAkMV85KxddQU7hNMr5BeCMgcyYVc-7E7tpErAyQ12LRvpnRdgMlg";

let registered = false;

/**
 * Best-effort FCM-style push subscription.
 * If the browser doesn't support push or the user denies permission, we exit silently.
 * Subscriptions are stored on `push_tokens` keyed to the auth user.
 */
export async function registerPush(userId: string) {
  if (registered) return;
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.register("/sw.js");
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
    });

    const token = JSON.stringify(sub);
    await supabase.from("push_tokens").upsert(
      { user_id: userId, token },
      { onConflict: "token" },
    );
    registered = true;
  } catch (e) {
    console.warn("Push registration skipped:", e);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}
