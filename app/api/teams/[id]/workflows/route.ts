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

  const member = await prisma.teamMember.findFirst({
    where: { teamId: id, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const workflows = await prisma.workflow.findMany({
    where: { teamId: id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(workflows);
}
