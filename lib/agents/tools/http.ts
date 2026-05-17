import { tool } from "ai";
import { z } from "zod";

export const httpTool = tool({
  description:
    "Make an HTTP request to any external API. Supports GET, POST, PUT, DELETE with custom headers and body.",
  inputSchema: z.object({
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).describe("HTTP method"),
    url: z.string().url().describe("Full URL to send the request to"),
    headers: z.record(z.string(), z.string()).optional().describe("Custom headers as key-value pairs"),
    body: z.string().optional().describe("Request body (JSON string for POST/PUT/PATCH)"),
  }),
  execute: async ({ method, url, headers, body }) => {
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");
      let responseData: unknown;

      if (contentType?.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      return {
        success: res.ok,
        status: res.status,
        statusText: res.statusText,
        data: responseData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
