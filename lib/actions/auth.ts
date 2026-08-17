"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { loginSchema, registerSchema } from "@/lib/validators/auth";

export type LoginInput = { email: string; password: string; next?: string };
export type RegisterInput = { fullName: string; phone: string; email: string; password: string };

export async function loginAction(input: LoginInput) {
  const data = await loginSchema.validate(input, { stripUnknown: true, abortEarly: true });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    return { error: error.message };
  }

  const locale = await getLocale();
  redirect({ href: input.next || "/", locale });
  return {};
}

export async function registerAction(input: RegisterInput) {
  const data = await registerSchema.validate(input, { stripUnknown: true, abortEarly: true });

  const supabase = await createClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.fullName } },
  });
  if (error) {
    return { error: error.message };
  }

  if (signUpData.user) {
    await supabase.from("profiles").update({ phone: data.phone }).eq("id", signUpData.user.id);
  }

  if (!signUpData.session) {
    return { needsConfirmation: true };
  }

  const locale = await getLocale();
  redirect({ href: "/", locale });
  return {};
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect({ href: "/", locale });
}
