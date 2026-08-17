"use server";

import { createClient } from "@/lib/supabase/server";
import { requestSchema, requestZodSchema } from "@/lib/validators/request";
import { uploadUserFile, getSignedUrl } from "@/lib/storage";
import { sendNotificationEmail, escapeHtml } from "@/lib/email/sendMail";
import { validateBoth } from "@/lib/validate";

export type RequestActionResult = { success?: boolean; error?: string };

export async function submitRequestAction(formData: FormData): Promise<RequestActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a request." };
  }

  let data;
  try {
    data = await validateBoth(requestSchema, requestZodSchema, {
      name: formData.get("name"),
      contact: formData.get("contact"),
      category: formData.get("category") || undefined,
      description: formData.get("description"),
      qtyOrBudget: formData.get("qtyOrBudget") || undefined,
      fulfillmentMethod: formData.get("fulfillmentMethod"),
      deliveryAddress: formData.get("deliveryAddress") || undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input";
    return { error: message };
  }

  const file = formData.get("attachment");
  let attachmentPath: string | null = null;
  if (file instanceof File && file.size > 0) {
    try {
      attachmentPath = await uploadUserFile(supabase, "request-attachments", user.id, file);
    } catch (err) {
      console.error("submitRequestAction upload:", err);
      return { error: "Failed to upload attachment" };
    }
  }

  const { error: insertError } = await supabase.from("requests").insert({
    customer_id: user.id,
    name: data.name,
    contact: data.contact,
    category: data.category ?? null,
    description: data.description,
    qty_or_budget: data.qtyOrBudget ?? null,
    fulfillment_method: data.fulfillmentMethod,
    delivery_address: data.deliveryAddress ?? null,
    attachment_url: attachmentPath,
  });

  if (insertError) {
    console.error("submitRequestAction insert:", insertError.message);
    return { error: "Failed to submit request" };
  }

  try {
    const attachmentLink = attachmentPath
      ? await getSignedUrl(supabase, "request-attachments", attachmentPath)
      : null;

    await sendNotificationEmail({
      subject: `New request from ${data.name}`,
      replyTo: user.email,
      html: `
        <p><b>Name:</b> ${escapeHtml(data.name)}</p>
        <p><b>Contact:</b> ${escapeHtml(data.contact)}</p>
        <p><b>Category:</b> ${escapeHtml(data.category ?? "—")}</p>
        <p><b>Description:</b><br/>${escapeHtml(data.description).replace(/\n/g, "<br/>")}</p>
        <p><b>Qty / Budget:</b> ${escapeHtml(data.qtyOrBudget ?? "—")}</p>
        <p><b>Fulfillment:</b> ${escapeHtml(data.fulfillmentMethod)}${
          data.deliveryAddress ? ` — ${escapeHtml(data.deliveryAddress)}` : ""
        }</p>
        ${attachmentLink ? `<p><b>Attachment:</b> <a href="${attachmentLink}">${attachmentLink}</a></p>` : ""}
      `,
    });
  } catch (err) {
    console.error("submitRequestAction email:", err);
    // Request is already saved; email failure shouldn't block the user.
  }

  return { success: true };
}
