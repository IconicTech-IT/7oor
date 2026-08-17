"use server";

import { contactSchema, contactZodSchema } from "@/lib/validators/contact";
import { sendNotificationEmail, escapeHtml } from "@/lib/email/sendMail";
import { validateBoth } from "@/lib/validate";

export type ContactInput = { name: string; contact: string; message: string };

export async function submitContactAction(input: ContactInput) {
  const data = await validateBoth(contactSchema, contactZodSchema, input);

  await sendNotificationEmail({
    subject: `New contact message from ${data.name}`,
    html: `
      <p><b>Name:</b> ${escapeHtml(data.name)}</p>
      <p><b>Contact:</b> ${escapeHtml(data.contact)}</p>
      <p><b>Message:</b><br/>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
    `,
  });
}
