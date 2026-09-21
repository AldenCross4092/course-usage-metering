import { z } from "zod";

export const usageEvent = z.object({
  customerId: z.string().min(1),
  courseId: z.string().min(1),
  requests: z.number().int().positive(),
});

export type UsageEvent = z.infer<typeof usageEvent>;

export function meterCustomer(events: UsageEvent[], customerId: string): number {
  return events.filter((event) => event.customerId === customerId)
    .reduce((total, event) => total + event.requests, 0);
}

export function decideAccess(usedRequests: number, includedRequests: number): "included" | "overage" {
  return usedRequests <= includedRequests ? "included" : "overage";
}
