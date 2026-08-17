"use server";

import { contactSchema } from "@/lib/validators/contact";
import { sendNotificationEmail, escapeHtml } from "@/lib/email/sendMail";

export type ContactInput = { name: string; contact: string; message: string };

export async function submitContactAction(input: ContactInput) {
  // Formik validates client-side for UX, but the server never trusts that —
  // re-validate here since this action can be called directly regardless of the UI.
  const data = await contactSchema.validate(input, { stripUnknown: true, abortEarly: true });

  await sendNotificationEmail({
    subject: `New contact message from ${data.name}`,
    html: `
      <p><b>Name:</b> ${escapeHtml(data.name)}</p>
      <p><b>Contact:</b> ${escapeHtml(data.contact)}</p>
      <p><b>Message:</b><br/>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
    `,
  });
}
