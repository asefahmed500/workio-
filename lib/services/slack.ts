export interface SlackOptions {
  webhookUrl: string;
  text: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

export interface SlackResult {
  success: boolean;
  error?: string;
}

export async function sendSlackMessage(options: SlackOptions): Promise<SlackResult> {
  try {
    const payload: Record<string, string> = { text: options.text };
    if (options.channel) payload.channel = options.channel;
    if (options.username) payload.username = options.username;
    if (options.iconEmoji) payload.icon_emoji = options.iconEmoji;

    const res = await fetch(options.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, error: `Slack API returned ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
