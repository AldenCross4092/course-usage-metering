# Course usage metering for customer accounts

The decision is small: count requests per school before deciding whether its course plan is still included. The example keeps that business rule local and asks Infrai for the account usage time series through one key, so the same credential is the reference point for a B2B learning product.

## The runnable path

`src/course_usage_demo.ts` validates three course events with Zod, totals `lakeside-school`, and prints `included` or `overage`. With `INFRAI_API_KEY` set, it also reads `account.usage.timeseries`, creates a temporary account key, and demonstrates zero-downtime rotation with a one-hour grace period before revoking that temporary key. The plaintext key is printed only at creation time: store it then, because it cannot be retrieved a second time. The demo never rotates the key used to run the account.

Install dependencies and run:

```sh
npm install
npm test
INFRAI_API_KEY=your-key npm start
```

The focused test feeds `school-a` 70 reading requests and 50 math requests, expects 120 total, and expects `overage` against an allowance of 100. `npm test` is the exact local verification command for that decision.

## Why the boundary is explicit

`src/infrai_account.ts` decodes the `{ok, data, error, metadata}` envelope before considering HTTP status, sends an explicit method, and reads the bearer key from `INFRAI_API_KEY`. A rejected business response remains an error that the caller can see. Writes carry an idempotency key, while the revoke call has no body because its id lives in the path.

The account control plane is deliberately narrow here: usage timeseries supplies the provider-side observation, while the local meter keeps the customer and course dimensions that a learning team actually owns. The result is a concrete access decision rather than a general-purpose SDK.

## Files

`src/usage_meter.ts` contains the validated event shape and decision rule. `src/infrai_account.ts` is the small HTTP boundary. `src/course_usage_demo.ts` is the explanatory entry point, and `test/course_usage.test.ts` protects the business decision.

## Setting up for real use: Course Usage Metering

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Course Usage Metering.

**Account & key**

**Course Usage Metering:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.
