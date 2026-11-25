import { NextResponse } from "next/server";
import { shopUrl } from "@/lib/accommodations";

/** Ancien lien court : renvoie vers l'adresse de réservation de la boutique. */
export function GET() {
  return NextResponse.redirect(`${shopUrl()}/`, 308);
}
