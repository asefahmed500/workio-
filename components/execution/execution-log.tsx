"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  AlertTriangle,
} from "lucide-react";

interface Execution {
  id: string;
  status: string;
  input: unknown;
  output: unknown;
  logs: unknown;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  workflow: { name: string };
}

interface ExecutionLogProps {
  execution: Execution;
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  failed: <XCircle className="h-5 w-5 text-red-500" />,
  running: <Play className="h-5 w-5 text-amber-500 animate-pulse" />,
  pending: <Clock className="h-5 w-5 text-gray-400" />,
  cancelled: <AlertTriangle className="h-5 w-5 text-gray-500" />,
};

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  running: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function ExecutionLog({ execution }: ExecutionLogProps) {
  const duration =
    execution.startedAt && execution.completedAt
      ? formatDistanceToNow(new Date(execution.completedAt))
      : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {statusIcons[execution.status]}
              <Badge variant="secondary" className={statusColors[execution.status]}>
                {execution.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Started</CardTitle>
          </CardHeader>
          <CardContent>
            {execution.startedAt
              ? formatDistanceToNow(new Date(execution.startedAt))
              : "N/A"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
          </CardHeader>
          <CardContent>{duration || "In progress"}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            {formatDistanceToNow(new Date(execution.createdAt))} ago
          </CardContent>
        </Card>
      </div>

      {execution.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-destructive whitespace-pre-wrap">
              {execution.error}
            </pre>
          </CardContent>
        </Card>
      )}

      {execution.output != null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {execution.input != null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Input</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(execution.input, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
