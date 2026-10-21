export type MergeRule = { name: string; from: string[]; sep?: string };

export function applyMerges(row: Record<string, any>, rules: MergeRule[]) {
  const out = { ...row };
  for (const r of rules) {
    out[r.name] = r.from.map(k => row[k] ?? "").join(r.sep ?? " ").trim();
  }
  return out;
}