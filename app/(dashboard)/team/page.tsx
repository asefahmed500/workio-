import { auth } from "@/lib/auth";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { TeamManager } from "@/components/team/team-manager";

export default async function TeamPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) redirect("/sign-in");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
        <p className="text-muted-foreground">
          Manage your teams and collaborate on workflows
        </p>
      </div>

      <TeamManager />
    </div>
  );
}
