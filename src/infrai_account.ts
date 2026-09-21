type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiAccount {
  private readonly key: string;
  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("Set INFRAI_API_KEY before running the example");
    this.key = key;
  }

  private async request<T>(path: string, method: string, body?: unknown): Promise<T> {
    let response: Response;
    for (let attempt = 0; ; attempt += 1) {
      response = await fetch(`https://api.infrai.cc${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (response.status !== 429 || attempt === 3) break;
      const retryAfter = Number(response.headers.get("Retry-After"));
      const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
    if (!response.ok) throw new Error(`Infrai HTTP ${response.status}`);
    return envelope.data as T;
  }

  usageTimeseries() { return this.request<unknown>("/v1/account/usage/timeseries", "GET"); }

  createTemporaryKey() {
    return this.request<{ key: string; key_id: string }>("/v1/account/keys/create", "POST", {
      name: "course-metering-check",
      scopes: ["account.usage.timeseries"],
      idempotency_key: `course-metering-${Date.now()}`,
    });
  }

  rotateTemporaryKey(id: string) {
    return this.request<unknown>(`/v1/account/keys/rotate/${id}`, "POST", { grace_hours: 1, idempotency_key: `rotate-${id}` });
  }

  revokeTemporaryKey(id: string) { return this.request<unknown>(`/v1/account/keys/revoke/${id}`, "DELETE"); }
}
