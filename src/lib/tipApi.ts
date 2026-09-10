const DEFAULT_URL = "http://127.0.0.1:8787";

export function tipServerBase(): string {
  const fromEnv = import.meta.env.VITE_TIP_SERVER_URL as string | undefined;
  return (fromEnv && fromEnv.trim()) || DEFAULT_URL;
}

export interface TipJarStatus {
  tipAddress: string;
  balance: number;
  tier: string;
  tierDetail?: string;
  recentTips?: unknown[];
  note?: string;
}

export interface TipResponse {
  ok: boolean;
  tipAddress: string;
  amount: number;
  from: string | null;
  memo: string | null;
  balance: number;
  tier: string;
  tierDetail?: string;
  event?: unknown;
}

export async function fetchTipJar(): Promise<TipJarStatus> {
  const res = await fetch(`${tipServerBase()}/tip-jar`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Tip jar request failed (${res.status})`);
  }
  return (await res.json()) as TipJarStatus;
}

export async function postTip(input: {
  amount: number;
  from?: string;
  memo?: string;
}): Promise<TipResponse> {
  const res = await fetch(`${tipServerBase()}/tip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await res.json().catch(() => ({}))) as TipResponse & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body.error ?? `Tip failed (${res.status})`);
  }
  return body;
}
