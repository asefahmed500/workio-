"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, Play, FileText, Clock } from "lucide-react";

interface StatsCardsProps {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  drafts: number;
}

export function StatsCards({
  totalWorkflows,
  activeWorkflows,
  totalExecutions,
  drafts,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Workflows",
      value: totalWorkflows,
      icon: Workflow,
      description: "All workflows",
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
    {
      title: "Active",
      value: activeWorkflows,
      icon: Play,
      description: "Running workflows",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Executions",
      value: totalExecutions,
      icon: FileText,
      description: "Total runs",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Drafts",
      value: drafts,
      icon: Clock,
      description: "Unpublished",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
