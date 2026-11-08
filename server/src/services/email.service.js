import { env } from "../config/env.js";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function sendUnlockEmail({ to, name, title }) {
  if (!env.emailApiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.emailApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: "Time Capsule <onboarding@resend.dev>",
        to: [to],
        subject: `Your capsule "${title}" is unlocked`,
        html: `<p>Hi ${escapeHtml(name)},</p>
               <p>Your time capsule <b>${escapeHtml(title)}</b> is ready to open.</p>
               <p><a href="${env.clientUrl}/dashboard">Open it now</a></p>`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) console.error("Email API responded with", res.status);
    return res.ok;
  } catch (err) {
    console.error("Email send failed:", err.message);
    return false;
  }
}