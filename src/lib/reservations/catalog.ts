import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import type { BikeTypePricing } from "@/lib/pricing";

/** Statuts d'un vélo présent dans la flotte d'un point de location (hors volés / retirés). */
const IN_FLEET = ["available", "reserved", "rented", "pending_check", "maintenance", "unavailable"];

const HOSTING_TYPES = ["classic", "electric"];
const HOSTING_ACCESSORIES = ["pannier"];

export type CatalogType = BikeTypePricing & {
  id: string; code: string; label: string;
  /** Tailles proposées (dans l'ordre du type) ; vide = taille unique. */
  sizes: string[];
};
export type CatalogAccessory = { id: string; code: string; label: string; daily_price_cents: number; stock: number };

export { accessoryField, qtyField } from "./fields";

/**
 * Ce que le client peut réserver à un point de location : seulement les types de vélo (et tailles)
 * qui y ont au moins un vélo, et les accessoires activés qui y sont en stock.
 */
export async function loadCatalog(accommodationId: string): Promise<{ types: CatalogType[]; accessories: CatalogAccessory[] }> {
  const db = createSupabaseServiceClient();
  const [{ data: place }, { data: types }, { data: bikes }, { data: stock }] = await Promise.all([
    db.from("accommodations").select("mode").eq("id", accommodationId).maybeSingle(),
    db.from("bike_types").select("*").eq("is_enabled", true).order("daily_price_cents", { ascending: false }),
    db.from("bikes").select("bike_type_id, frame_size").eq("accommodation_id", accommodationId).in("status", IN_FLEET),
    db.from("accommodation_accessories").select("stock, accessories(id, code, label, daily_price_cents, is_enabled, is_included)")
      .eq("accommodation_id", accommodationId).gt("stock", 0),
  ]);

  // Tailles, tandem et accessoires supplémentaires : uniquement à la boutique Chez Léon.
  // Les hébergements partenaires gardent l'offre d'origine (classique, électrique, sacoches, sans choix de taille).
  const shop = place?.mode === "counter";
  const fleet = (bikes ?? []) as { bike_type_id: string; frame_size: string | null }[];
  const catalogTypes: CatalogType[] = [];
  for (const t of (types ?? []) as (CatalogType & { sizes: string[] | null })[]) {
    const own = fleet.filter((b) => b.bike_type_id === t.id);
    if (own.length === 0) continue;
    if (!shop && !HOSTING_TYPES.includes(t.code)) continue;
    const present = new Set(own.map((b) => b.frame_size));
    const sizes = shop ? (t.sizes ?? []).filter((s) => present.has(s)) : [];
    catalogTypes.push({ ...t, sizes });
  }

  const accessories = ((stock ?? []) as unknown as { stock: number; accessories: { id: string; code: string; label: string; daily_price_cents: number; is_enabled: boolean; is_included: boolean } | null }[])
    .filter((s) => s.accessories && s.accessories.is_enabled && !s.accessories.is_included)
    .filter((s) => shop || HOSTING_ACCESSORIES.includes(s.accessories!.code))
    .map((s) => ({ id: s.accessories!.id, code: s.accessories!.code, label: s.accessories!.label, daily_price_cents: s.accessories!.daily_price_cents, stock: s.stock }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));

  return { types: catalogTypes, accessories };
}
