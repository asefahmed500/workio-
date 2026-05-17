import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          _count: {
            select: { members: true },
          },
        },
      },
    },
  });

  return NextResponse.json(memberships);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.team.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      members: {
        create: {
          userId: session.user.id,
          role: "owner",
        },
      },
    },
    include: {
      _count: { select: { members: true } },
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId: session.user.id,
      action: "team.created",
      entityType: "team",
      entityId: team.id,
      metadata: { name: team.name, slug: team.slug },
    },
  });

  return NextResponse.json(team, { status: 201 });
}
