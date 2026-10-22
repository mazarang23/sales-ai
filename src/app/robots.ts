import { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://foorooshyaar.ir").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/dashboard", "/upload", "/mapping", "/complete-profile"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}