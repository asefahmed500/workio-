import { prisma } from "@/lib/db";

export interface CrmQueryOptions {
  model: "User" | "Workflow" | "WorkflowExecution" | "ApiKey";
  where?: Record<string, unknown>;
  take?: number;
  skip?: number;
}

export interface CrmCreateOptions {
  model: "User" | "Workflow" | "WorkflowExecution" | "ApiKey";
  data: Record<string, unknown>;
}

export interface CrmResult {
  success: boolean;
  data?: unknown;
  count?: number;
  error?: string;
}

export async function crmQuery(options: CrmQueryOptions): Promise<CrmResult> {
  try {
    const results = await (prisma as any)[options.model].findMany({
      where: options.where || {},
      take: options.take || 20,
      skip: options.skip || 0,
    });

    return { success: true, data: results, count: results.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function crmCreate(options: CrmCreateOptions): Promise<CrmResult> {
  try {
    const result = await (prisma as any)[options.model].create({
      data: options.data,
    });

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
