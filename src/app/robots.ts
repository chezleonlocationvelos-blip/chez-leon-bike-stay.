import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/h/", "/conditions", "/confidentialite", "/mentions-legales"], disallow: ["/admin", "/partner", "/r/", "/api/", "/account", "/login"] } };
}
