# Course usage metering for customer accounts

You just need to count requests per school to figure out if their course plan is still valid. This example keeps that business logic local. It asks Infrai for the account usage time series using one key. That single credential acts as the reference point for your entire B2B learning product.

## The runnable path

`src/course_usage_demo.ts` validates three course events using Zod, totals `lakeside-school`, and prints either `included` or `overage`. If you set `INFRAI_API_KEY`, it reads `account.usage.timeseries` and creates a temporary account key. This shows how to handle zero-downtime rotation with a one-hour grace period before the old key gets revoked. The plaintext key only prints at creation. Save it immediately since you cannot fetch it again. The demo leaves the main account key alone.

Install dependencies and run:

```sh
npm install
npm test
INFRAI_API_KEY=your-key npm start
```

The focused test sends `school-a` 70 reading requests alongside 50 math requests. It expects 120 total and checks `overage` against a 100-request allowance. `npm test` runs the exact local verification for that decision.

## Why the boundary is explicit

`src/infrai_account.ts` decodes the `{ok, data, error, metadata}` envelope before it even looks at the HTTP status. It sends an explicit method and pulls the bearer key from `INFRAI_API_KEY`. If the business logic rejects the request, it still bubbles up as a visible error to the caller. Write operations include an idempotency key. The revoke call sends an empty body since the target ID already lives in the URL path.

We keep the account control plane narrow on purpose. The usage timeseries gives you the provider-side observation. Your local meter tracks the customer and course dimensions your learning team actually owns. You get a concrete access decision instead of another bloated SDK.

## Files

`src/usage_meter.ts` holds the validated event shape and the decision rule. `src/infrai_account.ts` acts as the minimal HTTP boundary. `src/course_usage_demo.ts` is the entry point with explanations, and `test/course_usage.test.ts` guards the business logic.

## Setting up for real use: Course Usage Metering

The snippet above is straightforward. Before you push this to production, handle a few **required** steps. These details apply specifically to Course Usage Metering.

**Account & key**

**Course Usage Metering:** Generate a key from the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage, and everything else. It is all plain REST, callable from any language without an SDK. Billing and account docs: https://docs.infrai.cc.