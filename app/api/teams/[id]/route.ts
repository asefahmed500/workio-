import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

async function checkTeamAccess(teamId: string, userId: string, minRole?: string) {
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId },
  });

  if (!member) return null;

  const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
  if (minRole && (roleHierarchy as any)[member.role] < (roleHierarchy as any)[minRole]) {
    return null;
  }

  return member;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const member = await checkTeamAccess(id, session.user.id);
  if (!member) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true, workflows: true } },
    },
  });

  return NextResponse.json(team);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const member = await checkTeamAccess(id, session.user.id, "admin");
  if (!member) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const team = await prisma.team.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(team);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const member = await checkTeamAccess(id, session.user.id, "owner");
  if (!member) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }

  await prisma.team.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
