import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const databaseTool = tool({
  description:
    "Query the application database. Use this to read records from the workio database.",
  inputSchema: z.object({
    model: z
      .enum(["User", "Workflow", "WorkflowExecution", "ApiKey"])
      .describe("Prisma model to query"),
    where: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Filter conditions as JSON object"),
    take: z.number().optional().describe("Limit results"),
  }),
  execute: async ({ model, where, take }) => {
    try {
      const results = await (prisma as any)[model].findMany({
        where: where || {},
        take: take || 20,
      });

      return { success: true, results, model, count: results.length };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
