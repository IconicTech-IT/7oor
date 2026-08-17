import "server-only";
import nodemailer from "nodemailer";

export function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let cachedTransport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_SMTP_USER,
        pass: process.env.GMAIL_SMTP_APP_PASSWORD,
      },
    });
  }
  return cachedTransport;
}

export async function sendNotificationEmail({
  subject,
  html,
  replyTo,
}: {
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const user = process.env.GMAIL_SMTP_USER;
  const pass = process.env.GMAIL_SMTP_APP_PASSWORD;
  const to = process.env.REQUESTS_NOTIFICATION_EMAIL || user;

  if (!user || !pass || !to) {
    console.warn("Gmail SMTP not configured — skipping email send.", { subject });
    return { skipped: true };
  }

  await getTransport().sendMail({
    from: `"7oor Store" <${user}>`,
    to,
    subject,
    html,
    replyTo,
  });
  return { skipped: false };
}
