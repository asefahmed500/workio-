import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { WorkflowList } from "@/components/workflows/workflow-list";

export default async function WorkflowsPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) redirect("/sign-in");

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">
            Manage and automate your workflows
          </p>
        </div>
      </div>

      <WorkflowList workflows={workflows} />
    </div>
  );
}
