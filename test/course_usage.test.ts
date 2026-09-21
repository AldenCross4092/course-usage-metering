import { strict as assert } from "node:assert";
import { decideAccess, meterCustomer, usageEvent } from "../src/usage_meter.ts";

const events = usageEvent.array().parse([
  { customerId: "school-a", courseId: "reading", requests: 70 },
  { customerId: "school-a", courseId: "math", requests: 50 },
  { customerId: "school-b", courseId: "reading", requests: 200 },
]);
assert.equal(meterCustomer(events, "school-a"), 120);
assert.equal(decideAccess(120, 100), "overage");
assert.equal(decideAccess(100, 100), "included");
console.log("course usage decision test passed");
