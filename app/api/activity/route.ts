import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const action = searchParams.get("action");

  const activities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      ...(action ? { action } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return NextResponse.json(activities);
}
