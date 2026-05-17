import { tool } from "ai";
import { z } from "zod";

export const emailTool = tool({
  description: "Send an email using Resend. Use this to send transactional or marketing emails.",
  inputSchema: z.object({
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject line"),
    body: z.string().describe("Email body content (HTML or plain text)"),
    from: z.string().optional().describe("Sender email (optional, uses default)"),
  }),
  execute: async ({ to, subject, body, from }) => {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: from || "Workio <onboarding@resend.dev>",
          to,
          subject,
          html: body,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || "Failed to send email" };
      }

      return { success: true, id: data.id, to, subject };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
