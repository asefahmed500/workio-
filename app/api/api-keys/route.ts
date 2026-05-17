import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  service: z.string().min(1).max(50),
  key: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      service: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(apiKeys);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createApiKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const apiKey = await prisma.apiKey.create({
    data: {
      name: parsed.data.name,
      service: parsed.data.service,
      key: parsed.data.key,
      metadata: parsed.data.metadata as any,
      userId: session.user.id,
    },
  });

  return NextResponse.json(apiKey, { status: 201 });
}
