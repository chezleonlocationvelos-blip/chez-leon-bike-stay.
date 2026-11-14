import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "partner";

export async function getCurrentRole(): Promise<{ userId: string; role: AppRole } | null> {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser(); // vérifie le jeton côté serveur
  if (!auth.user) return null;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", auth.user.id).maybeSingle();
  if (!data) return null;
  return { userId: auth.user.id, role: data.role as AppRole };
}

/** À appeler en tête de chaque layout/page protégé : contrôle serveur, jamais seulement côté navigateur. */
export async function requireRole(role: AppRole) {
  const current = await getCurrentRole();
  if (!current) redirect("/login");
  if (current.role !== role) redirect("/login");
  return current;
}
