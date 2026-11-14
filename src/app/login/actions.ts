"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function signIn(_: { error?: string } | undefined, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalid" };
  const supabase = await createSupabaseServerClient();
  const { data: auth, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !auth.user) return { error: "invalid" };
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", auth.user.id).maybeSingle();
  redirect(data?.role === "admin" ? "/admin" : "/partner");
}
