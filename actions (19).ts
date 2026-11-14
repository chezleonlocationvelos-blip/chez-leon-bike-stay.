"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ password: z.string().min(12).max(100), confirm: z.string() }).refine((v) => v.password === v.confirm);

export async function changePassword(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/account/password?error=invalid");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  redirect(`/account/password?${error ? "error=save" : "saved=1"}`);
}
