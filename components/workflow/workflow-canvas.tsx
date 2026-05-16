'use client';

import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragMoveEvent
} from '@dnd-kit/core';
import { useWorkflow } from '@/hooks/use-workflow';
import { WorkflowNode } from './workflow-node';
import { ConnectionLines } from './connection-lines';
import { NodePalette } from './node-palette';
import { PropertiesPanel } from './properties-panel';
import { CanvasBackground } from './canvas-background';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Transform } from '@dnd-kit/utilities';

interface DragData {
  source: 'palette' | 'node' | 'port';
  nodeId?: string;
  portId?: string;
  portType?: 'input' | 'output';
  nodeType?: string;
  name?: string;
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
    addConnection,
    deleteConnection
  } = useWorkflow();

  const [activeDrag, setActiveDrag] = useState<{ type: 'node' | 'palette' | 'port'; data: DragData } | null>(null);
  const [draggedNodePositions, setDraggedNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [connectionPreview, setConnectionPreview] = useState<{ sourceX: number; sourceY: number; targetX: number; targetY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Make the canvas a drop zone
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: 'canvas',
    data: {
      accepts: ['palette-node']
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    const source = data?.source;

    if (source === 'palette' && data) {
      setActiveDrag({ type: 'palette', data });
    } else if (source === 'node' && data) {
      setActiveDrag({ type: 'node', data });
    } else if (source === 'port' && data) {
      setActiveDrag({ type: 'port', data });
    }
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const data = event.active.data.current as DragData | undefined;
    const source = data?.source;

    if (source === 'node' && data?.nodeId) {
      const node = workflow.nodes.find(n => n.id === data.nodeId);
      if (node) {
        setDraggedNodePositions(prev => ({
          ...prev,
          [data.nodeId!]: {
            x: node.position.x + event.delta.x,
            y: node.position.y + event.delta.y
          }
        }));
      }
    } else if (source === 'port' && data?.nodeId && data?.portId) {
      // Update connection preview
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const node = workflow.nodes.find(n => n.id === data.nodeId);
        if (node) {
          const nodeType = node.type;
          // Calculate source port position
          const sourceX = node.position.x + 256; // Right side of node
          const sourceY = node.position.y + 100;
          // Calculate target position (mouse position relative to canvas)
          const targetX = (event.activatorEvent as MouseEvent).clientX - containerRect.left - canvasPosition.x;
          const targetY = (event.activatorEvent as MouseEvent).clientY - containerRect.top - canvasPosition.y;
          setConnectionPreview({ sourceX, sourceY, targetX, targetY });
        }
      }
    }
  }, [workflow.nodes, canvasPosition]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current as DragData | undefined;
    const source = activeData?.source;

    // Handle dropping new node from palette
    if (source === 'palette' && over && activeData) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect && event.activatorEvent instanceof MouseEvent) {
        const x = (event.activatorEvent.clientX - containerRect.left - canvasPosition.x) / canvasPosition.scale;
        const y = (event.activatorEvent.clientY - containerRect.top - canvasPosition.y) / canvasPosition.scale;
        addNode(activeData.nodeType!, { x, y });
      }
    }
    // Handle moving existing node
    else if (source === 'node' && activeData?.nodeId) {
      const newPosition = draggedNodePositions[activeData.nodeId];
      if (newPosition) {
        updateNode(activeData.nodeId, {
          position: {
            x: newPosition.x,
            y: newPosition.y
          }
        });
        setDraggedNodePositions(prev => {
          const next = { ...prev };
          delete next[activeData.nodeId!];
          return next;
        });
      }
    }
    // Handle creating connection
    else if (source === 'port' && activeData && over) {
      const overData = over.data.current as DragData | undefined;

      if (overData?.source === 'port' &&
          activeData.portType === 'output' &&
          overData.portType === 'input' &&
          activeData.nodeId !== overData.nodeId &&
          activeData.nodeId && activeData.portId &&
          overData.nodeId && overData.portId) {

        // Check if connection already exists
        const existingConnection = workflow.connections.find(
          c => c.sourceNodeId === activeData.nodeId &&
               c.sourcePort === activeData.portId &&
               c.targetNodeId === overData.nodeId &&
               c.targetPort === overData.portId
        );

        if (!existingConnection) {
          addConnection({
            id: `conn-${Date.now()}`,
            sourceNodeId: activeData.nodeId,
            sourcePort: activeData.portId,
            targetNodeId: overData.nodeId,
            targetPort: overData.portId
          });
        }
      }
    }

    setActiveDrag(null);
    setConnectionPreview(null);
  }, [addNode, canvasPosition, updateNode, draggedNodePositions, addConnection, workflow.connections]);

  const handleNodeDrag = useCallback((nodeId: string, transform: Transform) => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggedNodePositions(prev => ({
        ...prev,
        [nodeId]: {
          x: node.position.x + transform.x,
          y: node.position.y + transform.y
        }
      }));
    }
  }, [workflow.nodes]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not on nodes or connections
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
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedConnectionId) {
      deleteConnection(selectedConnectionId);
      setSelectedConnectionId(null);
    }
  }, [selectedConnectionId, deleteConnection, setSelectedConnectionId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Get effective node position (dragged position if being dragged, otherwise stored position)
  const getNodePosition = useCallback((nodeId: string) => {
    const draggedPos = draggedNodePositions[nodeId];
    if (draggedPos) {
      return { x: draggedPos.x, y: draggedPos.y };
    }
    const node = workflow.nodes.find(n => n.id === nodeId);
    return node ? { x: node.position.x, y: node.position.y } : null;
  }, [draggedNodePositions, workflow.nodes]);

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    workflow.nodes.forEach(node => {
      const pos = getNodePosition(node.id);
      if (pos) {
        positions[node.id] = pos;
      }
    });
    return positions;
  }, [workflow.nodes, getNodePosition]);

  // Clear dragged positions when component unmounts
  useEffect(() => {
    return () => {
      setDraggedNodePositions({});
    };
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Left Panel - Node Palette */}
        <NodePalette />

        {/* Main Canvas Area */}
        <div
          ref={(el) => {
            containerRef.current = el;
            setDroppableRef(el);
          }}
          className="flex-1 relative overflow-hidden"
          onClick={handleCanvasClick}
        >
          <CanvasBackground />

          {/* Connection preview line */}
          {connectionPreview && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1000 }}>
              <path
                d={`M ${connectionPreview.sourceX} ${connectionPreview.sourceY} L ${connectionPreview.targetX} ${connectionPreview.targetY}`}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            </svg>
          )}

          {/* Canvas content with transform */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasPosition.scale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Render all nodes */}
            {workflow.nodes.map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const effectiveNode = { ...node, position: { x: pos.x, y: pos.y } };
              return (
                <WorkflowNode
                  key={node.id}
                  node={effectiveNode}
                  selected={selectedNodeId === node.id}
                  onSelect={() => setSelectedNodeId(node.id)}
                  onDrag={handleNodeDrag}
                />
              );
            })}

            {/* Render connections */}
            <ConnectionLines
              connections={workflow.connections}
              nodePositions={nodePositions}
              onConnectionClick={handleConnectionClick}
              selectedConnectionId={selectedConnectionId}
            />
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setCanvasPosition(p => ({ ...p, scale: Math.max(0.25, p.scale - 0.1) }))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setCanvasPosition(p => ({ ...p, scale: Math.min(2, p.scale + 0.1) }))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-24 text-xs text-muted-foreground bg-card px-2 py-1 rounded border">
            {Math.round(canvasPosition.scale * 100)}%
          </div>

          {/* Help text */}
          {workflow.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">Get Started</p>
                <p className="text-sm">Drag nodes from the left panel to create your workflow</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {workflow.nodes.length > 0 && workflow.connections.length === 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-full border shadow-sm pointer-events-none">
              Drag from output ports (green) to input ports (blue) to connect nodes
            </div>
          )}
        </div>

        {/* Right Panel - Properties */}
        <PropertiesPanel />
      </div>

      <DragOverlay>
        {activeDrag?.type === 'palette' && (
          <div className="p-4 bg-card rounded-lg shadow-lg border">
            {activeDrag.data.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
