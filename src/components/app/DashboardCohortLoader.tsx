import { db } from "@/lib/db";
import { computeCohort, CohortRow } from "@/lib/analytics/cohort";
import { Period } from "@/lib/analytics/periods";
import { CohortSection } from "@/components/app/CohortSection";

type CohortsByPeriod = Record<Period, CohortRow[]>;

export async function DashboardCohortLoader({ uploadId }: { uploadId: string }) {
  const cached = await db.insight.findFirst({
    where: { uploadId, kind: "cohort" },
    orderBy: { createdAt: "desc" }
  });

  let cohortsByPeriod: CohortsByPeriod;
  if (cached) {
    cohortsByPeriod = cached.payload as unknown as CohortsByPeriod;
  } else {
    const rows = await db.dataRow.findMany({ where: { uploadId } });
    cohortsByPeriod = {
      day: computeCohort(rows as any, "day"),
      week: computeCohort(rows as any, "week"),
      month: computeCohort(rows as any, "month")
    };
    try {
      await db.insight.create({
        data: { uploadId, kind: "cohort", payload: cohortsByPeriod as any }
      });
    } catch (e) {
      console.error("cohort cache save error:", e);
    }
  }

  return <CohortSection cohortsByPeriod={cohortsByPeriod} />;
}