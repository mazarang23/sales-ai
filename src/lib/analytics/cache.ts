import { createHash } from "crypto";
import { db } from "@/lib/db";

/** Bump these versions whenever the corresponding algorithm/output contract changes. */
export const ANALYTICS_VERSIONS = {
  dashboard: "dashboard-v2",
  rfm: "rfm-v2",
  cohort: "cohort-v2",
} as const;

type JsonValue = unknown;

type CacheEnvelope = {
  key: string;
  version: string;
  data: JsonValue;
};

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

export function mappingVersion(mapping: unknown, algorithmVersion: string): string {
  const digest = createHash("sha256")
    .update(stableStringify(mapping ?? {}))
    .digest("hex")
    .slice(0, 16);
  return `${algorithmVersion}:${digest}`;
}

export async function readAnalyticsCache<T>(uploadId: string, kind: string, key: string): Promise<T | null> {
  const insight = await db.insight.findFirst({
    where: { uploadId, kind },
    orderBy: { createdAt: "desc" },
    select: { payload: true }
  });
  if (!insight) return null;
  const payload = insight.payload as CacheEnvelope;
  if (!payload || payload.key !== key || !("data" in payload)) return null;
  return payload.data as T;
}

export async function writeAnalyticsCache(uploadId: string, kind: string, key: string, version: string, data: JsonValue): Promise<void> {
  await db.insight.create({
    data: { uploadId, kind, payload: { key, version, data } as any }
  });
}

export async function getOrComputeAnalytics<T>(args: {
  uploadId: string;
  kind: string;
  mapping: unknown;
  algorithmVersion: string;
  compute: () => Promise<T> | T;
}): Promise<{ data: T; cached: boolean }> {
  const key = `${args.uploadId}:${mappingVersion(args.mapping, args.algorithmVersion)}`;
  const cached = await readAnalyticsCache<T>(args.uploadId, args.kind, key);
  if (cached !== null) return { data: cached, cached: true };

  const data = await args.compute();
  await writeAnalyticsCache(args.uploadId, args.kind, key, args.algorithmVersion, data);
  return { data, cached: false };
}
