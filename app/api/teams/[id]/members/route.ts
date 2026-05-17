import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "editor", "viewer"]).default("viewer"),
});

const updateRoleSchema = z.object({
  role: z.enum(["owner", "admin", "editor", "viewer"]),
});

async function checkTeamAccess(teamId: string, userId: string, minRole: string) {
  const member = await prisma.teamMember.findFirst({ where: { teamId, userId } });
  if (!member) return null;

  const roleHierarchy: Record<string, number> = { owner: 4, admin: 3, editor: 2, viewer: 1 };
  if (roleHierarchy[member.role] < roleHierarchy[minRole]) return null;

  return member;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const member = await prisma.teamMember.findFirst({ where: { teamId: id, userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const members = await prisma.teamMember.findMany({
    where: { teamId: id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json(members);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const member = await checkTeamAccess(id, session.user.id, "admin");
  if (!member) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const body = await request.json();
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.teamMember.findFirst({
    where: { teamId: id, userId: user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 });
  }

  const newMember = await prisma.teamMember.create({
    data: {
      teamId: id,
      userId: user.id,
      role: parsed.data.role,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await prisma.activity.create({
    data: {
      userId: session.user.id,
      action: "team.member_added",
      entityType: "team",
      entityId: id,
      metadata: { memberEmail: parsed.data.email, role: parsed.data.role },
    },
  });

  return NextResponse.json(newMember, { status: 201 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { memberId, role } = body;

  const actor = await checkTeamAccess(id, session.user.id, "owner");
  if (!actor) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const updated = await prisma.teamMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  const targetMember = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!targetMember) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  if (targetMember.teamId !== id) return NextResponse.json({ error: "Invalid team" }, { status: 400 });

  if (targetMember.userId === session.user.id) {
    await prisma.teamMember.delete({ where: { id: memberId } });
    return NextResponse.json({ success: true });
  }

  const actor = await checkTeamAccess(id, session.user.id, "admin");
  if (!actor) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  await prisma.teamMember.delete({ where: { id: memberId } });

  return NextResponse.json({ success: true });
}
