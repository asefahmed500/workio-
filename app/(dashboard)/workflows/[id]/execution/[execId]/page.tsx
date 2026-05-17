import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { ExecutionLog } from "@/components/execution/execution-log";

export default async function ExecutionViewerPage({
  params,
}: {
  params: Promise<{ id: string; execId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) redirect("/sign-in");

  const { id, execId } = await params;

  const execution = await prisma.workflowExecution.findFirst({
    where: { id: execId, userId: session.user.id },
    include: {
      workflow: {
        select: { name: true },
      },
    },
  });

  if (!execution) redirect("/workflows");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Execution: {execution.workflow.name}
        </h1>
        <p className="text-muted-foreground">
          Status:{" "}
          <span
            className={
              execution.status === "completed"
                ? "text-green-500"
                : execution.status === "failed"
                ? "text-red-500"
                : execution.status === "running"
                ? "text-amber-500"
                : "text-gray-500"
            }
          >
            {execution.status}
          </span>
        </p>
      </div>

      <ExecutionLog execution={execution} />
    </div>
  );
}
