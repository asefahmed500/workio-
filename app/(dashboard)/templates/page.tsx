import { auth } from "@/lib/auth";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Webhook, GitBranch, Clock, PhoneIncoming, Globe } from "lucide-react";

const templates = [
  {
    id: "email-welcome",
    name: "Welcome Email Sequence",
    description: "Send a series of welcome emails when a new user signs up",
    category: "Email",
    nodes: ["Webhook", "Send Email", "Delay", "Send Email"],
    icon: Mail,
    color: "blue",
  },
  {
    id: "lead-notification",
    name: "Lead Notification",
    description: "Notify your Slack channel when a new lead comes in via webhook",
    category: "Notification",
    nodes: ["Webhook", "Condition", "Slack Message"],
    icon: Webhook,
    color: "purple",
  },
  {
    id: "call-routing",
    name: "Call Center Routing",
    description: "Route incoming calls through IVR and create support tickets",
    category: "Call Center",
    nodes: ["Incoming Call", "IVR Menu", "Condition", "Create Issue"],
    icon: PhoneIncoming,
    color: "green",
  },
  {
    id: "api-sync",
    name: "API Data Sync",
    description: "Fetch data from an external API and process based on conditions",
    category: "Automation",
    nodes: ["Webhook", "HTTP Request", "Condition", "Send Email"],
    icon: Globe,
    color: "purple",
  },
  {
    id: "delayed-followup",
    name: "Delayed Follow-up",
    description: "Wait 24 hours after a trigger, then send a follow-up email",
    category: "Email",
    nodes: ["Webhook", "Delay", "Send Email"],
    icon: Clock,
    color: "blue",
  },
  {
    id: "branching-workflow",
    name: "Branching Logic",
    description: "Complex workflow with multiple conditional branches and actions",
    category: "Automation",
    nodes: ["Webhook", "Condition", "HTTP Request", "Send Email", "Create Issue"],
    icon: GitBranch,
    color: "yellow",
  },
];

const categoryColors: Record<string, string> = {
  Email: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Notification: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Call Center": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Automation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default async function TemplatesPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session) redirect("/sign-in");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">
          Start with a pre-built workflow template
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="hover:shadow-lg transition-shadow group"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 bg-${template.color}-500/10`}
                  >
                    <template.icon className={`h-5 w-5 text-${template.color}-500`} />
                  </div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {template.nodes.map((node, i) => (
                    <span
                      key={i}
                      className="text-xs bg-muted px-2 py-1 rounded"
                    >
                      {node}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={categoryColors[template.category]}
                  >
                    {template.category}
                  </Badge>
                  <Button size="sm" asChild>
                    <Link href={`/workflows/new?template=${template.id}`}>
                      <Plus className="mr-1 h-3 w-3" />
                      Use Template
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
