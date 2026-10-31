/*
  The email I get when someone sends a message through the contact form.

  The message is saved to Supabase first (that's what counts). Only after that,
  app/api/contact/route.ts sends me a short alert through Resend (resend.com), so I
  don't have to keep checking the admin inbox. If the email can't be sent, the
  visitor's message is still saved and they still see "sent".

  Two settings, only on the server (never sent to the browser):
    RESEND_API_KEY        my Resend key
    CONTACT_ALERT_EMAIL   where the alert goes (with Resend's free sender, it must be
                          the email address my Resend account uses)
  If either is missing, no email is sent and everything else works as before.
*/

export type AlertMessage = { name: string; email: string; message: string };

export const ALERT_FROM = "Portfolio inbox <onboarding@resend.dev>";
const PREVIEW = 1000; // the email shows the first 1000 characters; the rest is in the admin inbox

/** Makes text safe to put inside HTML, so a message can't add links, images or scripts to my email */
export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** The alert's settings, or null if they're not both set */
export function alertSettings(env: Record<string, string | undefined>) {
  const key = env.RESEND_API_KEY?.trim();
  const to = env.CONTACT_ALERT_EMAIL?.trim();
  return key && to ? { key, to } : null;
}

/** The email itself: subject, plain text and HTML. "Reply" in my email app replies to the visitor. */
export function alertEmail(msg: AlertMessage, siteUrl: string, to: string) {
  const preview = msg.message.length > PREVIEW ? `${msg.message.slice(0, PREVIEW)}…` : msg.message;
  // Line breaks in a subject can be used to sneak in extra email headers, so they're flattened
  const subject = `New message from ${msg.name}`.replace(/[\r\n]+/g, " ").slice(0, 120);
  const inbox = `${siteUrl.replace(/\/$/, "")}/admin`;
  const text = `${msg.name} (${msg.email}) sent you a message on your portfolio:\n\n${preview}\n\nReply to this email to answer them, or open your inbox: ${inbox}`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">
<p><strong>${escapeHtml(msg.name)}</strong> (${escapeHtml(msg.email)}) sent you a message on your portfolio:</p>
<blockquote style="margin:16px 0;padding:12px 16px;border-left:4px solid #27f4d2;background:#f4f6f8;white-space:pre-wrap">${escapeHtml(preview)}</blockquote>
<p>Reply to this email to answer them, or <a href="${escapeHtml(inbox)}">open your inbox</a>.</p>
</div>`;
  return { from: ALERT_FROM, to: [to], reply_to: msg.email, subject, text, html };
}

/** Sends the alert. Never throws: returns true if Resend accepted it. */
export async function sendAlert(msg: AlertMessage, siteUrl: string, env: Record<string, string | undefined>, send: typeof fetch = fetch) {
  const settings = alertSettings(env);
  if (!settings) return false;
  try {
    const res = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${settings.key}`, "Content-Type": "application/json" },
      body: JSON.stringify(alertEmail(msg, siteUrl, settings.to)),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
