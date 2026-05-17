"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Square, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  status: "pending" | "running" | "completed" | "failed";
  output?: unknown;
  error?: string;
  timestamp?: Date;
}

interface WorkflowExecutionViewerProps {
  workflowId: string;
  nodes: Array<{ id: string; type: string; name: string }>;
  connections: Array<{ sourceNodeId: string; targetNodeId: string }>;
}

export function WorkflowExecutionViewer({
  workflowId,
  nodes,
  connections,
}: WorkflowExecutionViewerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setSteps(
      nodes.map((n) => ({
        nodeId: n.id,
        nodeType: n.type,
        status: "pending",
      }))
    );

    try {
      const res = await fetch("/api/agents/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: {} })),
          connections,
          input: {},
        }),
      });

      if (!res.ok) throw new Error("Execution failed to start");

      setExecutionId(`exec-${Date.now()}`);
      toast.success("Workflow execution started");
    } catch {
      toast.error("Failed to start workflow execution");
      setIsRunning(false);
    }
  }, [workflowId, nodes, connections]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setActiveNodeId(null);
    toast.info("Workflow execution stopped");
  }, []);

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-gray-400" />,
    running: <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    running: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Execution</CardTitle>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button size="sm" onClick={handleRun}>
              <Play className="mr-2 h-4 w-4" />
              Run
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={handleStop}>
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.nodeId}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                  activeNodeId === step.nodeId
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/20"
                    : ""
                }`}
              >
                {statusIcons[step.status]}
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.nodeType}</p>
                  <p className="text-xs text-muted-foreground">{step.nodeId}</p>
                </div>
                <Badge variant="secondary" className={statusColors[step.status]}>
                  {step.status}
                </Badge>
              </div>
            ))}
            {steps.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Click Run to execute the workflow
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
