import { InfraiAccount } from "./infrai_account.ts";
import { decideAccess, meterCustomer, usageEvent } from "./usage_meter.ts";

const events = usageEvent.array().parse([
  { customerId: "lakeside-school", courseId: "algebra-1", requests: 120 },
  { customerId: "lakeside-school", courseId: "biology-1", requests: 80 },
  { customerId: "evening-college", courseId: "algebra-1", requests: 40 },
]);
const customerId = "lakeside-school";
const used = meterCustomer(events, customerId);
console.log({ customerId, usedRequests: used, access: decideAccess(used, 250) });

if (process.env.INFRAI_API_KEY) {
  const account = new InfraiAccount();
  const series = await account.usageTimeseries();
  console.log("Infrai account usage timeseries received", series);
  const temporary = await account.createTemporaryKey();
  console.log("Temporary key created once; store the plaintext now because it cannot be retrieved a second time.", temporary.key_id);
  await account.rotateTemporaryKey(temporary.key_id);
  await account.revokeTemporaryKey(temporary.key_id);
}
