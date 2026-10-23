import assert from "node:assert/strict";
import { test } from "node:test";
import { computeKpis } from "../src/lib/analytics/kpi";
import { computeRfm } from "../src/lib/analytics/rfm";
import { computeCohort } from "../src/lib/analytics/cohort";

test("KPI counts distinct order IDs plus rows without an order ID", () => {
  const result = computeKpis([
    { customer: "A", orderId: "1", amount: 100 },
    { customer: "A", orderId: "1", amount: 50 },
    { customer: "B", orderId: "2", amount: 25 },
    { customer: "C", orderId: "", amount: 10 },
    { customer: "D", amount: 5 }
  ]);
  assert.equal(result.orders, 4);
  assert.equal(result.total, 190);
});

test("RFM merges Persian/Latin spacing variants of the same customer", () => {
  const result = computeRfm([
    { customer: " علی  رضایی ", orderId: "1", amount: 100, date: "2026-01-01" },
    { customer: "علی رضایی", orderId: "2", amount: 50, date: "2026-01-10" },
    { customer: "علي رضایی", orderId: "3", amount: 25, date: "2026-01-20" }
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].count, 3);
  assert.equal(result[0].sum, 175);
  assert.equal(result[0].recency, 0);
});

test("RFM uses the latest valid dataset date and handles undated customers safely", () => {
  const result = computeRfm([
    { customer: "A", orderId: "1", amount: 100, date: "2026-02-01" },
    { customer: "B", orderId: "2", amount: 100, date: "not-a-date" },
    { customer: "C", orderId: "3", amount: 0, date: "2026-02-10" },
    { customer: "D", orderId: "4", amount: -20, date: "2026-02-10" }
  ]);
  const a = result.find(x => x.name === "A");
  const b = result.find(x => x.name === "B");
  assert.equal(a?.recency, 9);
  assert.equal(b?.hasDate, false);
  assert.equal(b?.rScore, 0);
});

test("Cohort merges customer identity variants across periods", () => {
  const result = computeCohort([
    { customer: "علي  رضایی", amount: 100, date: "2026-01-10" },
    { customer: "علي رضایی", amount: 50, date: "2026-02-10" },
    { customer: "مریم", amount: 80, date: "2026-01-15" }
  ], "month");
  const january = result.find(x => x.cohortKey === "2026-01-01");
  assert.ok(january);
  assert.equal(january?.size, 2);
  assert.equal(january?.periods[0]?.retained, 2);
  assert.equal(january?.periods[1]?.retained, 1);
});

test("Cohort ignores invalid dates instead of shifting retention", () => {
  const result = computeCohort([
    { customer: "A", amount: 100, date: "not-a-date" },
    { customer: "A", amount: 100, date: "2026-01-10" }
  ], "month");
  assert.equal(result.length, 1);
  assert.equal(result[0].size, 1);
});
