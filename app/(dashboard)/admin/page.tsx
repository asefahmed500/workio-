import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) redirect("/sign-in");

  if (session.user.role !== "admin" && session.user.role !== "administrator") {
    redirect("/dashboard");
  }

  const [userCount, workflowCount, teamCount, executionCount] = await Promise.all([
    prisma.user.count(),
    prisma.workflow.count(),
    prisma.team.count(),
    prisma.workflowExecution.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { workflows: true } },
    },
  });

  const recentActivities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <AdminPanel
      stats={{ userCount, workflowCount, teamCount, executionCount }}
      recentUsers={recentUsers}
      recentActivities={recentActivities}
    />
  );
}
