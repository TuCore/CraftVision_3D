const { test } = require("node:test");
const assert = require("node:assert/strict");
const { todayVietnam, shiftDate, presetRange, filterError, changePercent } = require("../node_modules/.dashboard-tests/types.js");

test("report presets use Vietnam dates across UTC midnight, months and leap years", () => {
  assert.equal(todayVietnam(new Date("2026-10-28T18:00:00Z")), "2026-10-29");
  assert.deepEqual(presetRange("7", "2026-03-03"), { from: "2026-02-25", to: "2026-03-03" });
  assert.deepEqual(presetRange("month", "2026-03-03"), { from: "2026-03-01", to: "2026-03-03" });
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29");
});
test("invalid dates and oversized report ranges cannot be applied", () => {
  const filters = { from: "2025-01-01", to: "2025-01-30", kind: "all", method: "all", groupBy: "day" };
  assert.equal(filterError(filters), null);
  for (const changes of [{ from: "" }, { from: "2025-02-30" }, { to: "2024-12-31" }, { to: "2026-01-02" }, { to: "2099-01-01" }]) assert.ok(filterError({ ...filters, ...changes }));
});
test("comparisons do not invent percentages when the previous period is zero", () => {
  assert.equal(changePercent(100, 0), null);
  assert.equal(changePercent(150, 100), 50);
  assert.equal(changePercent(50, 100), -50);
  assert.equal(changePercent(0, -100), 100);
});
