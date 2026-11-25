import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rafraîchit la session et bloque l'accès anonyme. Les rôles sont revérifiés dans requireRole().
const SHOP_HOST = "reserver.chezleonlocation.com";
const SHOP_SLUG = "boutique-savonnieres";
const PROTECTED = /^\/(admin|partner|account)(\/|$)/;

export async function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const { pathname } = request.nextUrl;

  // Réservation boutique : sa propre adresse, la racine affiche directement la page de réservation.
  if (host === SHOP_HOST && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/h/${SHOP_SLUG}`;
    return NextResponse.rewrite(url);
  }
  // Sur Bike & Stay, la page boutique renvoie vers l'adresse de la boutique.
  if (host !== SHOP_HOST && host.endsWith("chezleonlocation.com") && pathname === `/h/${SHOP_SLUG}`) {
    return NextResponse.redirect(`https://${SHOP_HOST}/`, 308);
  }
  if (!PROTECTED.test(pathname)) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/login", request.url));
  return response;
}

export const config = { matcher: ["/", "/h/:path*", "/admin/:path*", "/partner/:path*", "/account/:path*"] };
