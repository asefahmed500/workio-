"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Loader2,
  ArrowLeft,
  Play,
  Undo2,
  Redo2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WorkflowToolbarProps {
  workflowName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRun: () => void;
}

export function WorkflowToolbar({
  workflowName,
  onNameChange,
  onSave,
  isSaving,
  hasChanges,
  onUndo,
  onRedo,
  onRun,
}: WorkflowToolbarProps) {
  return (
    <div className="flex h-14 items-center gap-3 border-b bg-card px-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/workflows">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      <Input
        value={workflowName}
        onChange={(e) => onNameChange(e.target.value)}
        className="w-64 font-semibold"
        placeholder="Workflow name..."
      />

      {hasChanges && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Unsaved changes
        </span>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onUndo} title="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRedo} title="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>

        <Button size="sm" onClick={onRun}>
          <Play className="mr-2 h-4 w-4" />
          Run
        </Button>
      </div>
    </div>
  );
}
