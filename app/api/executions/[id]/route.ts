import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const execution = await prisma.workflowExecution.findFirst({
    where: { id, userId: session.user.id },
    include: {
      workflow: {
        select: { name: true },
      },
    },
  });

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  return NextResponse.json(execution);
}
