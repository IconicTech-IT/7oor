"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import {
  loginSchema,
  loginZodSchema,
  registerSchema,
  registerZodSchema,
  sanitizeRedirectPath,
} from "@/lib/validators/auth";
import { validateBoth } from "@/lib/validate";

export type LoginInput = { email: string; password: string; next?: string };
export type RegisterInput = { fullName: string; phone: string; email: string; password: string };

export async function loginAction(input: LoginInput) {
  let data;
  try {
    data = await validateBoth(loginSchema, loginZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    return { error: error.message };
  }

  const locale = await getLocale();
  redirect({ href: sanitizeRedirectPath(input.next), locale });
  return {};
}

export async function registerAction(input: RegisterInput) {
  let data;
  try {
    data = await validateBoth(registerSchema, registerZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

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
