export interface DiscordOptions {
  webhookUrl: string;
  content: string;
  username?: string;
  avatarUrl?: string;
}

export interface DiscordResult {
  success: boolean;
  error?: string;
}

export async function sendDiscordMessage(options: DiscordOptions): Promise<DiscordResult> {
  try {
    const payload: Record<string, string> = { content: options.content };
    if (options.username) payload.username = options.username;
    if (options.avatarUrl) payload.avatar_url = options.avatarUrl;

    const res = await fetch(options.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok && res.status !== 204) {
      return { success: false, error: `Discord API returned ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
