import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { WorkflowEditor } from "@/components/workflows/workflow-editor";

export default async function WorkflowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) redirect("/sign-in");

  const { id } = await params;

  let workflow = null;
  if (id !== "new") {
    workflow = await prisma.workflow.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!workflow) redirect("/workflows");
  }

  return <WorkflowEditor workflow={workflow} />;
}
