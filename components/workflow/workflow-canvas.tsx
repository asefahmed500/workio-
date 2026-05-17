'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import { useWorkflow } from '@/hooks/use-workflow';
import { Workflow } from '@/types/workflow';
import { WorkflowNode } from './workflow-node';
import { ConnectionLines } from './connection-lines';
import { NodePalette } from './node-palette';
import { PropertiesPanel } from './properties-panel';
import { CanvasBackground } from './canvas-background';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface DragData {
  source: 'palette' | 'node' | 'port';
  nodeId?: string;
  portId?: string;
  portType?: 'input' | 'output';
  nodeType?: string;
  name?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function WorkflowCanvas() {
  const {
    workflow,
    selectedNodeId,
    setSelectedNodeId,
    selectedConnectionId,
    setSelectedConnectionId,
    canvasPosition,
    setCanvasPosition,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection
  } = useWorkflow();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{ type: string; data: DragData } | null>(null);
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null);

  // Type assertion to help TypeScript infer correctly
  const activeDragData = activeDrag?.data ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    const data = event.active.data.current as DragData | undefined;
    if (data) {
      setActiveDrag({ type: data.source, data });
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current as DragData | undefined;
    const source = activeData?.source;
    const GRID_SIZE = 20;

    if (source === 'palette' && over && activeData) {
      const canvasEl = document.getElementById('canvas-drop-zone');
      if (canvasEl && event.activatorEvent instanceof MouseEvent) {
        const rect = canvasEl.getBoundingClientRect();
        
        // Calculate position relative to canvas
        const currentMouseX = event.activatorEvent.clientX + event.delta.x;
        const currentMouseY = event.activatorEvent.clientY + event.delta.y;

        const rawX = (currentMouseX - rect.left - canvasPosition.x) / canvasPosition.scale;
        const rawY = (currentMouseY - rect.top - canvasPosition.y) / canvasPosition.scale;
        
        // Snap to grid and offset to center the node (assuming w-64 = 256px)
        const x = Math.round((rawX - 128) / GRID_SIZE) * GRID_SIZE;
        const y = Math.round((rawY - 40) / GRID_SIZE) * GRID_SIZE;
        
        addNode(activeData.nodeType!, { 
          x: Math.max(0, x), 
          y: Math.max(0, y) 
        });
      }
    } else if (source === 'node' && activeData?.nodeId) {
      const node = workflow.nodes.find(n => n.id === activeData.nodeId);
      if (node) {
        // Snap movement to grid
        const newX = Math.round((node.position.x + (event.delta.x / canvasPosition.scale)) / GRID_SIZE) * GRID_SIZE;
        const newY = Math.round((node.position.y + (event.delta.y / canvasPosition.scale)) / GRID_SIZE) * GRID_SIZE;
        
        updateNode(activeData.nodeId, {
          position: {
            x: Math.max(0, newX),
            y: Math.max(0, newY)
          }
        });
      }
    } else if (source === 'port' && activeData && over) {
      const overData = over.data.current as DragData | undefined;
      if (overData?.source === 'port' && activeData.nodeId !== overData.nodeId) {
        const sourceNodeId = activeData.portType === 'output' ? activeData.nodeId : overData.nodeId;
        const sourcePort = activeData.portType === 'output' ? activeData.portId : overData.portId;
        const targetNodeId = activeData.portType === 'input' ? activeData.nodeId : overData.nodeId;
        const targetPort = activeData.portType === 'input' ? activeData.portId : overData.portId;

        const sourceSide = activeData.portType === 'output' ? activeData.side : overData.side;
        const targetSide = activeData.portType === 'input' ? activeData.side : overData.side;

        if (activeData.portType !== overData.portType) {
          const existingConnection = workflow.connections.find(
            c => c.sourceNodeId === sourceNodeId &&
                 c.sourcePort === sourcePort &&
                 c.targetNodeId === targetNodeId &&
                 c.targetPort === targetPort
          );

          if (!existingConnection && sourceNodeId && sourcePort && targetNodeId && targetPort) {
            addConnection({
              id: `conn-${Date.now()}`,
              sourceNodeId: sourceNodeId!,
              sourcePort: sourcePort!,
              sourceSide: sourceSide!,
              targetNodeId: targetNodeId!,
              targetPort: targetPort!,
              targetSide: targetSide!
            });
          }
        }
      }
    }

    setActiveId(null);
    setActiveDrag(null);
    setDragDelta(null);
  }, [addNode, updateNode, addConnection, workflow.nodes, workflow.connections, canvasPosition.x, canvasPosition.y, canvasPosition.scale]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { delta } = event;
    setDragDelta({ x: delta.x, y: delta.y });
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
    }
  }, [setSelectedNodeId, setSelectedConnectionId]);

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedNodeId(null);
  }, [setSelectedConnectionId, setSelectedNodeId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
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
  }, [selectedConnectionId, selectedNodeId, deleteConnection, deleteNode, setSelectedConnectionId, setSelectedNodeId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <NodePalette />

        <CanvasDropZone
          onCanvasClick={handleCanvasClick}
          workflow={workflow}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          canvasPosition={canvasPosition}
          setCanvasPosition={setCanvasPosition}
          selectedConnectionId={selectedConnectionId}
          handleConnectionClick={handleConnectionClick}
          activeDrag={activeDragData}
          dragDelta={dragDelta}
        />

        <PropertiesPanel />
      </div>

      <DragOverlay adjustScale={false}>
        {activeDrag?.type === 'palette' && (
          <div className="p-4 bg-card rounded-lg shadow-xl border-2 border-primary/50 cursor-grabbing w-64 opacity-80 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold text-sm">{activeDrag.data.name}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded animate-pulse" />
          </div>
        )}
        {activeDrag?.type === 'node' && (
          <div className="w-64 h-32 bg-primary/5 border-2 border-primary border-dashed rounded-lg flex items-center justify-center opacity-50">
            <span className="text-primary font-medium text-xs">Moving Node...</span>
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
  dragDelta: { x: number; y: number } | null;
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
  dragDelta
}: CanvasDropZoneProps) {
  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
    data: { accepts: ['palette', 'node', 'port'] }
  });

  return (
    <>
      <div
        ref={setNodeRef}
        id="canvas-drop-zone"
        className="flex-1 relative overflow-hidden bg-muted/5 select-none"
        onClick={onCanvasClick}
        onMouseDown={(e) => {
          // Panning logic: Middle click or Alt + Left click
          if (e.button === 1 || (e.button === 0 && e.altKey)) {
            e.preventDefault();
            e.stopPropagation();
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startPos = { ...canvasPosition };

            const onMouseMove = (moveEvent: MouseEvent) => {
              const dx = moveEvent.clientX - startX;
              const dy = moveEvent.clientY - startY;
              setCanvasPosition({
                ...startPos,
                x: startPos.x + dx,
                y: startPos.y + dy
              });
            };

            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }
        }}
      >
        <CanvasBackground position={canvasPosition} scale={canvasPosition.scale} />

        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasPosition.scale})`,
            transformOrigin: '0 0',
          }}
        >
          <ConnectionLines
            connections={workflow.connections}
            nodes={workflow.nodes}
            onConnectionClick={handleConnectionClick}
            selectedConnectionId={selectedConnectionId}
            canvasScale={canvasPosition.scale}
            activeDrag={activeDrag}
            dragDelta={dragDelta}
          />
          
          {workflow.nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              onSelect={() => setSelectedNodeId(node.id)}
              isDragging={false}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setCanvasPosition({ ...canvasPosition, scale: Math.max(0.25, canvasPosition.scale - 0.1) })}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setCanvasPosition({ ...canvasPosition, scale: Math.min(2, canvasPosition.scale + 0.1) })}
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

      {workflow.nodes.length > 0 && workflow.connections.length === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-full border shadow-sm pointer-events-none">
          Drag from output ports (green) to input ports (blue) to connect nodes
        </div>
      )}
    </>
  );
}
