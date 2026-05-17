import { auth } from "@/lib/auth";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { ApiKeysManager } from "@/components/settings/api-keys-manager";

export default async function ApiKeysPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) redirect("/sign-in");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your integrations and credentials
        </p>
      </div>

      <ApiKeysManager />
    </div>
  );
}
