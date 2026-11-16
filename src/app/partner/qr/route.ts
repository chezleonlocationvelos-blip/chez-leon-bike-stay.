import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getCurrentRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** QR code de l'hébergement du partenaire connecté. La RLS limite la lecture à ses propres hébergements. */
export async function GET(request: Request) {
  const current = await getCurrentRole();
  if (current?.role !== "partner") return new NextResponse("Forbidden", { status: 403 });

  const params = new URL(request.url).searchParams;
  const accId = params.get("acc");
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("accommodations").select("slug").eq("is_active", true).limit(1);
  if (accId) query = query.eq("id", accId);
  const { data } = await query.maybeSingle();
  if (!data) return new NextResponse("Not found", { status: 404 });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${base}/h/${data.slug}`;

  if (params.get("format") === "png") {
    const png = await QRCode.toBuffer(url, { width: 1024, margin: 2, errorCorrectionLevel: "M" });
    return new NextResponse(new Uint8Array(png), {
      headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="qr-${data.slug}.png"` },
    });
  }
  const svg = await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
  const download = params.get("format") === "svg-download";
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      ...(download ? { "Content-Disposition": `attachment; filename="qr-${data.slug}.svg"` } : {}),
    },
  });
}
