import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  nodes: z.array(z.any()).optional(),
  connections: z.array(z.any()).optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(workflows);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const workflow = await prisma.workflow.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      userId: session.user.id,
      nodes: parsed.data.nodes || [],
      connections: parsed.data.connections || [],
    },
  });

  return NextResponse.json(workflow, { status: 201 });
}
