import { getMessages } from "@/i18n";

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;
  return (
    <div role="status" className="bg-accent px-4 py-2 text-center text-sm font-medium text-charcoal">
      {getMessages().app.demoBanner}
    </div>
  );
}
