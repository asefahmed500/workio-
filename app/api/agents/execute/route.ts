import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { workflowId } = body;

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId: session.user.id },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      userId: session.user.id,
      status: "pending",
      input: {
        nodes: workflow.nodes,
        connections: workflow.connections,
      } as unknown as object,
    },
  });

  return NextResponse.json({ executionId: execution.id }, { status: 201 });
}
