import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://foorooshyaar.ir").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/pricing", "/about", "/blog"];
  const industries = ["clothing", "gold", "cosmetics", "restaurant", "grocery", "digital"];

  let posts: { slug: string; createdAt: Date }[] = [];
  try {
    posts = await db.blogPost.findMany({
      where: { published: true },
      select: { slug: true, createdAt: true }
    });
  } catch {
    posts = [];
  }

  return [
    ...staticRoutes.map(route => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7
    })),
    ...industries.map(slug => ({
      url: `${SITE_URL}/industry/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6
    })),
    ...posts.map(post => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.5
    }))
  ];
}