import { createAgentUIStreamResponse } from "ai";
import { workflowAgent, type WorkflowInput } from "@/lib/agents/workflow-agent";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const input = body as WorkflowInput;

  // Create execution record
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId: input.workflowId,
      userId: session.user.id,
      status: "running",
      input: input as unknown as object,
      startedAt: new Date(),
    },
  });

  try {
    const prompt = `Execute the following workflow:

Workflow ID: ${input.workflowId}
Input: ${JSON.stringify(input.input)}

Nodes:
${input.nodes.map((n) => `- ${n.id} (${n.type}): ${JSON.stringify(n.data)}`).join("\n")}

Connections:
${input.connections.map((c) => `- ${c.sourceNodeId} -> ${c.targetNodeId}`).join("\n")}

Execute each node in order and report the results.`;

    return createAgentUIStreamResponse({
      agent: workflowAgent,
      uiMessages: [{ role: "user", content: prompt, id: `msg-${Date.now()}` }],
      onFinish: async ({ messages }) => {
        await prisma.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: "completed",
            output: messages as unknown as object,
            completedAt: new Date(),
          },
        });
      },
    });
  } catch (error) {
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });

    return Response.json(
      { error: "Workflow execution failed" },
      { status: 500 }
    );
  }
}
