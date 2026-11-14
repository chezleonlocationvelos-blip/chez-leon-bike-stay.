import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getCurrentRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentRole();
  if (current?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("accommodations").select("slug").eq("id", id).maybeSingle();
  if (!data) return new NextResponse("Not found", { status: 404 });

  // URL stable basée sur le slug : le QR code reste valide si le nom commercial change.
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${base}/h/${data.slug}`;
  const format = new URL(request.url).searchParams.get("format");

  if (format === "png") {
    const png = await QRCode.toBuffer(url, { width: 1024, margin: 2, errorCorrectionLevel: "M" });
    return new NextResponse(new Uint8Array(png), {
      headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="qr-${data.slug}.png"` },
    });
  }
  const svg = await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
