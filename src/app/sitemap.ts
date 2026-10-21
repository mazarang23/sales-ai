import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const staticRoutes = ["", "/pricing", "/about", "/blog", "/register"];
  const industries = ["clothing", "gold", "cosmetics", "restaurant", "grocery", "digital"];
  const posts = await db.blogPost.findMany({ where: { published: true } });

  return [
    ...staticRoutes.map(r => ({
      url: `${base}${r}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: r === "" ? 1 : 0.7
    })),
    ...industries.map(s => ({
      url: `${base}/industry/${s}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6
    })),
    ...posts.map(p => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.5
    }))
  ];
}