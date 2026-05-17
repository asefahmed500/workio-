"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Workflow {
  id: string;
  name: string;
  status: string;
  updatedAt: Date;
}

interface RecentWorkflowsProps {
  workflows: Workflow[];
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function RecentWorkflows({ workflows }: RecentWorkflowsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Workflows</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/workflows">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No workflows yet</p>
            <Button asChild>
              <Link href="/workflows">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workflow
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <Link
                    href={`/workflows/${workflow.id}`}
                    className="font-medium hover:underline"
                  >
                    {workflow.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(workflow.updatedAt))} ago
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={statusColors[workflow.status]}
                >
                  {workflow.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
