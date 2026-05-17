export interface DelayOptions {
  milliseconds: number;
}

export interface DelayResult {
  success: boolean;
  waitedMs: number;
  error?: string;
}

export async function delay(options: DelayOptions): Promise<DelayResult> {
  const ms = Math.min(options.milliseconds, 300000);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, waitedMs: ms });
    }, ms);
  });
}

export function parseDelayString(input: string): number {
  const match = input.match(/^(\d+)\s*(ms|s|m|h)?$/i);
  if (!match) return 5000;

  const value = parseInt(match[1], 10);
  const unit = (match[2] || "s").toLowerCase();

  switch (unit) {
    case "ms": return value;
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    default: return value * 1000;
  }
}
