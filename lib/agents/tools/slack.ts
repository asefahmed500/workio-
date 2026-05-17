import { tool } from "ai";
import { z } from "zod";

export const slackTool = tool({
  description: "Send a message to a Slack channel via webhook URL.",
  inputSchema: z.object({
    webhookUrl: z.string().url().describe("Slack incoming webhook URL"),
    text: z.string().describe("Message text to send"),
    channel: z.string().optional().describe("Channel name (optional if set in webhook)"),
  }),
  execute: async ({ webhookUrl, text, channel }) => {
    try {
      const payload: Record<string, string> = { text };
      if (channel) payload.channel = channel;

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return { success: false, error: `Slack API returned ${res.status}` };
      }

      return { success: true, text, channel };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
