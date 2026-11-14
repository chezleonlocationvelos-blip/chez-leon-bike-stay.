"use client";
import { useActionState } from "react";
import { signIn } from "./actions";
import { Button } from "@/components/ui/Button";
import { getMessages } from "@/i18n";

export default function LoginPage() {
  const t = getMessages().login;
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-forest">{t.title}</h1>
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          {t.email}
          <input name="email" type="email" required autoComplete="email" className="min-h-12 rounded-xl2 border border-sage bg-white px-4" />
        </label>
        <label className="flex flex-col gap-1">
          {t.password}
          <input name="password" type="password" required autoComplete="current-password" className="min-h-12 rounded-xl2 border border-sage bg-white px-4" />
        </label>
        {state?.error && <p role="alert" className="text-red-700">{t.error}</p>}
        <Button type="submit" disabled={pending}>{t.submit}</Button>
      </form>
    </main>
  );
}
