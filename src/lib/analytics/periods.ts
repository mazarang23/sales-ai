export type Period = "day" | "week" | "month";

export function periodKey(date: Date, period: Period): string {
  const d = new Date(date);
  if (period === "day") {
    return d.toISOString().slice(0, 10);
  }
  if (period === "week") {
    // شنبه به عنوان شروع هفته (تقویم ایرانی)
    // به روزهای هفته جاوااسکریپت: یکشنبه=0، دوشنبه=1، ... شنبه=6
    const day = d.getUTCDay();
    const diffToSaturday = (day + 1) % 7;
    const saturday = new Date(d);
    saturday.setUTCDate(d.getUTCDate() - diffToSaturday);
    return saturday.toISOString().slice(0, 10);
  }
  // month
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function periodLabel(key: string, period: Period): string {
  const d = new Date(key + "T00:00:00Z");
  if (period === "day") {
    return d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "UTC"
    });
  }
  if (period === "week") {
    return "هفته " + d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "UTC"
    });
  }
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    timeZone: "UTC"
  });
}