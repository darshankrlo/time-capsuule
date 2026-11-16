import { env } from "../config/env.js";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function sendEmail({ to, subject, html }) {
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
        subject,
        html,
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

export function sendUnlockEmail({ to, name, title }) {
  return sendEmail({
    to,
    subject: `Your capsule "${title}" is unlocked`,
    html: `<p>Hi ${escapeHtml(name)},</p>
           <p>Your time capsule <b>${escapeHtml(title)}</b> is ready to open.</p>
           <p><a href="${env.clientUrl}/dashboard">Open it now</a></p>`,
  });
}

export async function sendResetEmail({ to, name, link }) {
  if (!env.emailApiKey) {
    console.log(`[no email key] Password reset link for ${to}: ${link}`);
    return false;
  }
  return sendEmail({
    to,
    subject: "Reset your Time Capsule password",
    html: `<p>Hi ${escapeHtml(name)},</p>
           <p>Click the link below to choose a new password. It expires in 30 minutes.</p>
           <p><a href="${link}">Reset password</a></p>
           <p>If you didn't ask for this, you can ignore this email.</p>`,
  });
}