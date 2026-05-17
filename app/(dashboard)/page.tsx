import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentWorkflows } from "@/components/dashboard/recent-workflows";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) redirect("/sign-in");

  const [workflowCount, activeCount, executionCount, draftCount] = await Promise.all([
    prisma.workflow.count({ where: { userId: session.user.id } }),
    prisma.workflow.count({ where: { userId: session.user.id, status: "active" } }),
    prisma.workflowExecution.count({ where: { userId: session.user.id } }),
    prisma.workflow.count({ where: { userId: session.user.id, status: "draft" } }),
  ]);

  const recentWorkflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
    },
  });

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}
        </p>
      </div>

      <StatsCards
        totalWorkflows={workflowCount}
        activeWorkflows={activeCount}
        totalExecutions={executionCount}
        drafts={draftCount}
      />

      <RecentWorkflows workflows={recentWorkflows} />
    </div>
  );
}
