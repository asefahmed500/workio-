"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  Workflow,
  WorkflowNode,
  Connection,
} from "@/types/workflow";
import { WorkflowNode as WorkflowNodeComponent } from "@/components/workflow/workflow-node";
import { ConnectionLines } from "@/components/workflow/connection-lines";
import { NodePalette } from "@/components/workflow/node-palette";
import { PropertiesPanel } from "@/components/workflow/properties-panel";
import { CanvasBackground } from "@/components/workflow/canvas-background";
import { WorkflowToolbar } from "@/components/workflows/workflow-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DragData {
  source: "palette" | "node" | "port";
  nodeId?: string;
  portId?: string;
  portType?: "input" | "output";
  nodeType?: string;
  name?: string;
  side?: "top" | "bottom" | "left" | "right";
}

interface WorkflowEditorProps {
  workflow: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    nodes: unknown;
    connections: unknown;
  } | null;
}

export function WorkflowEditor({ workflow }: WorkflowEditorProps) {
  const router = useRouter();
  const isNew = !workflow;

  const [wf, setWf] = useState<Workflow>({
    id: workflow?.id || `wf-${Date.now()}`,
    name: workflow?.name || "Untitled Workflow",
    nodes: (workflow?.nodes as WorkflowNode[]) || [],
    connections: (workflow?.connections as Connection[]) || [],
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0, scale: 1 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{ type: string; data: DragData } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState(wf.name);
  const [hasChanges, setHasChanges] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  // Auto-save debounce
  const scheduleAutoSave = useCallback(() => {
    setHasChanges(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 3000);
  }, [wf]);

  const handleSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setIsSaving(true);
    try {
      const url = isNew ? "/api/workflows" : `/api/workflows/${wf.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          nodes: wf.nodes,
          connections: wf.connections,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      if (isNew) {
        router.push(`/workflows/${data.id}`);
      }
      setHasChanges(false);
      toast.success("Workflow saved");
    } catch {
      toast.error("Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  }, [wf, workflowName, isNew, router]);

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: {},
      };
      setWf((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
      setSelectedNodeId(newNode.id);
      setSelectedConnectionId(null);
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNode>) => {
      setWf((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        ),
      }));
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setWf((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => n.id !== nodeId),
        connections: prev.connections.filter(
          (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
        ),
      }));
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
      scheduleAutoSave();
    },
    [selectedNodeId, scheduleAutoSave]
  );

  const addConnection = useCallback(
    (connection: Connection) => {
      setWf((prev) => ({
        ...prev,
        connections: [...prev.connections, connection],
      }));
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const deleteConnection = useCallback(
    (connectionId: string) => {
      setWf((prev) => ({
        ...prev,
        connections: prev.connections.filter((c) => c.id !== connectionId),
      }));
      if (selectedConnectionId === connectionId) setSelectedConnectionId(null);
      scheduleAutoSave();
    },
    [selectedConnectionId, scheduleAutoSave]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    const data = event.active.data.current as DragData | undefined;
    if (data) setActiveDrag({ type: data.source, data });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeData = active.data.current as DragData | undefined;
      const source = activeData?.source;
      const GRID_SIZE = 20;

      if (source === "palette" && over && activeData) {
        const canvasEl = document.getElementById("canvas-drop-zone");
        if (canvasEl && event.activatorEvent instanceof MouseEvent) {
          const rect = canvasEl.getBoundingClientRect();
          const currentMouseX = event.activatorEvent.clientX + event.delta.x;
          const currentMouseY = event.activatorEvent.clientY + event.delta.y;
          const rawX = (currentMouseX - rect.left - canvasPosition.x) / canvasPosition.scale;
          const rawY = (currentMouseY - rect.top - canvasPosition.y) / canvasPosition.scale;
          const x = Math.round((rawX - 128) / GRID_SIZE) * GRID_SIZE;
          const y = Math.round((rawY - 40) / GRID_SIZE) * GRID_SIZE;
          addNode(activeData.nodeType!, {
            x: Math.max(0, x),
            y: Math.max(0, y),
          });
        }
      } else if (source === "node" && activeData?.nodeId) {
        const node = wf.nodes.find((n) => n.id === activeData.nodeId);
        if (node) {
          const newX =
            Math.round(
              (node.position.x + event.delta.x / canvasPosition.scale) / GRID_SIZE
            ) * GRID_SIZE;
          const newY =
            Math.round(
              (node.position.y + event.delta.y / canvasPosition.scale) / GRID_SIZE
            ) * GRID_SIZE;
          updateNode(activeData.nodeId, {
            position: { x: Math.max(0, newX), y: Math.max(0, newY) },
          });
        }
      } else if (source === "port" && activeData && over) {
        const overData = over.data.current as DragData | undefined;
        if (
          overData?.source === "port" &&
          activeData.nodeId !== overData.nodeId &&
          activeData.portType !== overData.portType
        ) {
          const sourceNodeId =
            activeData.portType === "output" ? activeData.nodeId : overData.nodeId;
          const sourcePort =
            activeData.portType === "output" ? activeData.portId : overData.portId;
          const targetNodeId =
            activeData.portType === "input" ? activeData.nodeId : overData.nodeId;
          const targetPort =
            activeData.portType === "input" ? activeData.portId : overData.portId;
          const sourceSide =
            activeData.portType === "output" ? activeData.side : overData.side;
          const targetSide =
            activeData.portType === "input" ? activeData.side : overData.side;

          const exists = wf.connections.some(
            (c) =>
              c.sourceNodeId === sourceNodeId &&
              c.sourcePort === sourcePort &&
              c.targetNodeId === targetNodeId &&
              c.targetPort === targetPort
          );

          if (!exists && sourceNodeId && sourcePort && targetNodeId && targetPort) {
            addConnection({
              id: `conn-${Date.now()}`,
              sourceNodeId,
              sourcePort,
              sourceSide,
              targetNodeId,
              targetPort,
              targetSide,
            });
          }
        }
      }

      setActiveId(null);
      setActiveDrag(null);
    },
    [addNode, updateNode, addConnection, wf.nodes, wf.connections, canvasPosition]
  );

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    // Drag move handled internally by dnd-kit
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
      }
    },
    []
  );

  const handleConnectionClick = useCallback(
    (connectionId: string) => {
      setSelectedConnectionId(connectionId);
      setSelectedNodeId(null);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedConnectionId) {
          e.preventDefault();
          deleteConnection(selectedConnectionId);
          setSelectedConnectionId(null);
        } else if (selectedNodeId) {
          e.preventDefault();
          deleteNode(selectedNodeId);
          setSelectedNodeId(null);
        }
      }
    },
    [selectedConnectionId, selectedNodeId, deleteConnection, deleteNode]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Left: Node Palette */}
        <NodePalette />

        {/* Center: Canvas */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <WorkflowToolbar
            workflowName={workflowName}
            onNameChange={setWorkflowName}
            onSave={handleSave}
            isSaving={isSaving}
            hasChanges={hasChanges}
            onUndo={() => {}}
            onRedo={() => {}}
            onRun={() => toast.info("Workflow execution coming soon")}
          />

          {/* Canvas Area */}
          <CanvasDropZone
            onCanvasClick={handleCanvasClick}
            workflow={wf}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            canvasPosition={canvasPosition}
            setCanvasPosition={setCanvasPosition}
            selectedConnectionId={selectedConnectionId}
            handleConnectionClick={handleConnectionClick}
            activeDrag={activeDrag?.data ?? null}
          />
        </div>

        {/* Right: Properties Panel */}
        <PropertiesPanel />
      </div>

      <DragOverlay adjustScale={false}>
        {activeDrag?.type === "palette" && (
          <div className="p-4 bg-card rounded-lg shadow-xl border-2 border-primary/50 cursor-grabbing w-64 opacity-80 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold text-sm">{activeDrag.data.name}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded animate-pulse" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface CanvasDropZoneProps {
  onCanvasClick: (e: React.MouseEvent) => void;
  workflow: Workflow;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  canvasPosition: { x: number; y: number; scale: number };
  setCanvasPosition: (pos: { x: number; y: number; scale: number }) => void;
  selectedConnectionId: string | null;
  handleConnectionClick: (id: string) => void;
  activeDrag: DragData | null;
}

function CanvasDropZone({
  onCanvasClick,
  workflow,
  selectedNodeId,
  setSelectedNodeId,
  canvasPosition,
  setCanvasPosition,
  selectedConnectionId,
  handleConnectionClick,
  activeDrag,
}: CanvasDropZoneProps) {
  const { setNodeRef } = useDroppable({
    id: "canvas-drop-zone",
    data: { accepts: ["palette", "node", "port"] },
  });

  return (
    <>
      <div
        ref={setNodeRef}
        id="canvas-drop-zone"
        className="flex-1 relative overflow-hidden bg-muted/5 select-none"
        onClick={onCanvasClick}
        onMouseDown={(e) => {
          if (e.button === 1 || (e.button === 0 && e.altKey)) {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startPos = { ...canvasPosition };

            const onMouseMove = (moveEvent: MouseEvent) => {
              setCanvasPosition({
                ...startPos,
                x: startPos.x + (moveEvent.clientX - startX),
                y: startPos.y + (moveEvent.clientY - startY),
              });
            };

            const onMouseUp = () => {
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }
        }}
        onWheel={(e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.05 : 0.05;
          setCanvasPosition({
            ...canvasPosition,
            scale: Math.max(0.25, Math.min(2, canvasPosition.scale + delta)),
          });
        }}
      >
        <CanvasBackground position={canvasPosition} scale={canvasPosition.scale} />

        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasPosition.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <ConnectionLines
            connections={workflow.connections}
            nodes={workflow.nodes}
            onConnectionClick={handleConnectionClick}
            selectedConnectionId={selectedConnectionId}
            canvasScale={canvasPosition.scale}
            activeDrag={activeDrag}
          />

          {workflow.nodes.map((node) => (
            <WorkflowNodeComponent
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              onSelect={() => setSelectedNodeId(node.id)}
              isDragging={false}
            />
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={() =>
            setCanvasPosition({
              ...canvasPosition,
              scale: Math.max(0.25, canvasPosition.scale - 0.1),
            })
          }
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() =>
            setCanvasPosition({
              ...canvasPosition,
              scale: Math.min(2, canvasPosition.scale + 0.1),
            })
          }
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 right-24 text-xs text-muted-foreground bg-card px-2 py-1 rounded border">
        {Math.round(canvasPosition.scale * 100)}%
      </div>

      {workflow.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Get Started</p>
            <p className="text-sm">Drag nodes from the left panel to create your workflow</p>
          </div>
        </div>
      )}
    </>
  );
}
