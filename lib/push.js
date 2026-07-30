// Sends browser push notifications via the Web Push protocol (VAPID).
// No third-party notification service needed — this talks directly to
// each browser vendor's push service (Chrome, Firefox, Edge, etc.).
//
// Setup (2 minutes):
//   1. npm install (pulls in the "web-push" package now listed in package.json)
//   2. Generate a VAPID key pair:
//        npx web-push generate-vapid-keys
//   3. Add to .env.local (and to Vercel's Environment Variables for prod):
//        NEXT_PUBLIC_VAPID_PUBLIC_KEY=<the "Public Key" it printed>
//        VAPID_PRIVATE_KEY=<the "Private Key" it printed>
//        VAPID_SUBJECT=mailto:you@yourdomain.com
//
// If the VAPID keys aren't set, this silently no-ops so local dev without
// them configured doesn't crash — same pattern as lib/mailer.js.

const webpush = require("web-push");
const { query } = require("./db");

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:offbook@example.com";

let configured = false;
if (PUBLIC_KEY && PRIVATE_KEY) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
  configured = true;
}

// Sends a push notification to every device the given user has subscribed
// on. Best-effort: a dead/expired subscription is quietly removed instead
// of failing the caller, and one broken subscription doesn't stop the rest.
async function sendPushToUser(userId, { title, body, url }) {
  if (!configured) {
    console.warn(
      "[push] VAPID keys are not set — skipping push notification.\n" +
        `[push] Would have notified user ${userId}: ${title} — ${body}`
    );
    return { skipped: true };
  }

  const subs = await query(
    "SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1",
    [userId]
  );

  const payload = JSON.stringify({ title, body, url: url || "/messages" });

  await Promise.all(
    subs.rows.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err) {
        // 404/410 means the browser unsubscribed or the subscription expired
        // on the push service's end — clean it up instead of retrying forever.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await query("DELETE FROM push_subscriptions WHERE id = $1", [sub.id]);
        } else {
          console.error("[push] failed to send to subscription", sub.id, err.message);
        }
      }
    })
  );

  return { sent: subs.rows.length };
}

module.exports = { sendPushToUser };