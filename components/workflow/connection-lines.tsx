'use client';

import { Connection, WorkflowNode } from '@/types/workflow';
import { getNodeType } from '@/lib/workflow/node-registry';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ConnectionLinesProps {
  connections: Connection[];
  nodes: WorkflowNode[];
  onConnectionClick?: (connectionId: string) => void;
  selectedConnectionId?: string | null;
  canvasScale: number;
  activeDrag?: DragData | null;
  dragDelta?: { x: number; y: number } | null | undefined;
}

interface DragData {
  source: 'palette' | 'node' | 'port';
  nodeId?: string;
  portId?: string;
  portType?: 'input' | 'output';
  nodeType?: string;
  name?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function ConnectionLines({
  connections,
  nodes,
  onConnectionClick,
  selectedConnectionId,
  canvasScale,
  activeDrag,
  dragDelta
}: ConnectionLinesProps) {
  const previewLine = useMemo(() => {
    if (activeDrag?.source === 'port' && dragDelta && activeDrag.nodeId) {
      const sourceNode = nodes.find(n => n.id === activeDrag.nodeId);
      if (!sourceNode) return null;

      const sourcePos = calculatePortPosition(
        sourceNode.position,
        activeDrag.side || 'right',
        activeDrag.nodeId,
        activeDrag.portId,
        nodes
      );

      const targetX = sourcePos.x + (dragDelta.x / canvasScale);
      const targetY = sourcePos.y + (dragDelta.y / canvasScale);

      return {
        sx: sourcePos.x,
        sy: sourcePos.y,
        tx: targetX,
        ty: targetY,
        sSide: activeDrag.side || 'right',
        tSide: 'left' // Default target side for preview
      };
    }
    return null;
  }, [activeDrag, dragDelta, nodes, canvasScale]);

  return (
    <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ pointerEvents: 'none' }}>
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" opacity="0.5" />
        </marker>
        <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
        </marker>
        <marker id="arrowhead-preview" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
        </marker>
      </defs>

      {connections.map(conn => (
        <ConnectionLine
          key={conn.id}
          connection={conn}
          nodes={nodes}
          onClick={onConnectionClick}
          isSelected={selectedConnectionId === conn.id}
          activeDragId={null}
          dragDelta={dragDelta}
          canvasScale={canvasScale}
        />
      ))}

      {previewLine && (
        <path
          d={calculateBezierPath(
            previewLine.sx,
            previewLine.sy,
            previewLine.tx,
            previewLine.ty,
            previewLine.sSide,
            previewLine.tSide
          )}
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeDasharray="6,4"
          fill="none"
          markerEnd="url(#arrowhead-preview)"
          className="animate-[dash_20s_linear_infinite]"
          style={{ filter: 'url(#glow)' }}
        />
      )}
    </svg>
  );
}

function calculatePortPosition(
  pos: { x: number; y: number },
  side: 'top' | 'bottom' | 'left' | 'right',
  nodeId?: string,
  portId?: string,
  nodes?: WorkflowNode[]
) {
  const w = 256; // Node width (w-64)
  const h = 106; // Approximate node height
  const portSpacing = 24; // Spacing between multiple ports

  // Default position (center of side)
  let x: number, y: number;

  switch (side) {
    case 'top':
      x = pos.x + w / 2;
      y = pos.y;
      break;
    case 'bottom':
      x = pos.x + w / 2;
      y = pos.y + h;
      break;
    case 'left':
      x = pos.x;
      y = pos.y + h / 2;
      break;
    case 'right':
      x = pos.x + w;
      y = pos.y + h / 2;
      break;
    default:
      x = pos.x + w;
      y = pos.y + h / 2;
  }

  // Apply offset for multiple ports if we have node and port information
  if (nodeId && portId && nodes) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const nodeType = getNodeType(node.type);
      if (nodeType) {
        // Find the port in inputs or outputs
        const inputPort = nodeType.inputs.find(p => p.id === portId);
        const outputPort = nodeType.outputs.find(p => p.id === portId);

        if (inputPort) {
          const index = nodeType.inputs.indexOf(inputPort);
          const totalPorts = nodeType.inputs.length;
          if (totalPorts > 1 && (side === 'left' || side === 'top')) {
            const offset = ((index / (totalPorts - 1)) - 0.5) * (totalPorts - 1) * portSpacing;
            if (side === 'left') y += offset;
            else x += offset;
          }
        } else if (outputPort) {
          const index = nodeType.outputs.indexOf(outputPort);
          const totalPorts = nodeType.outputs.length;
          if (totalPorts > 1) {
            const offset = ((index / (totalPorts - 1)) - 0.5) * (totalPorts - 1) * portSpacing;
            if (side === 'right' || side === 'left') y += offset;
            else x += offset;
          }
        }
      }
    }
  }

  return { x, y };
}


function calculateBezierPath(sx: number, sy: number, tx: number, ty: number, sSide: string, tSide: string) {
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.max(Math.min(dist * 0.4, 150), 50);

  let c1x = sx;
  let c1y = sy;
  let c2x = tx;
  let c2y = ty;

  if (sSide === 'right') c1x += offset;
  else if (sSide === 'left') c1x -= offset;
  else if (sSide === 'top') c1y -= offset;
  else if (sSide === 'bottom') c1y += offset;

  if (tSide === 'right') c2x += offset;
  else if (tSide === 'left') c2x -= offset;
  else if (tSide === 'top') c2y -= offset;
  else if (tSide === 'bottom') c2y += offset;

  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
}

interface ConnectionLineProps {
  connection: Connection;
  nodes: WorkflowNode[];
  onClick?: (connectionId: string) => void;
  isSelected?: boolean;
  activeDragId: string | null;
  dragDelta: { x: number; y: number } | null | undefined;
  canvasScale: number;
}

function ConnectionLine({
  connection,
  nodes,
  onClick,
  isSelected,
  activeDragId,
  dragDelta,
  canvasScale
}: ConnectionLineProps) {
  const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
  const targetNode = nodes.find(n => n.id === connection.targetNodeId);

  if (!sourceNode || !targetNode) return null;

  const sPos = { ...sourceNode.position };
  const tPos = { ...targetNode.position };

  if (activeDragId === sourceNode.id && dragDelta) {
    sPos.x += dragDelta.x / canvasScale;
    sPos.y += dragDelta.y / canvasScale;
  }
  if (activeDragId === targetNode.id && dragDelta) {
    tPos.x += dragDelta.x / canvasScale;
    tPos.y += dragDelta.y / canvasScale;
  }

  const sourcePos = calculatePortPosition(
    sPos,
    connection.sourceSide || 'right',
    connection.sourceNodeId,
    connection.sourcePort,
    nodes
  );
  const targetPos = calculatePortPosition(
    tPos,
    connection.targetSide || 'left',
    connection.targetNodeId,
    connection.targetPort,
    nodes
  );

  const path = calculateBezierPath(
    sourcePos.x, 
    sourcePos.y, 
    targetPos.x, 
    targetPos.y, 
    connection.sourceSide || 'right', 
    connection.targetSide || 'left'
  );

  return (
    <g style={{ pointerEvents: 'stroke' }} className="group/connection">
      <path
        d={path}
        stroke={isSelected ? "hsl(var(--primary))" : "currentColor"}
        strokeWidth={isSelected ? "4" : "2.5"}
        fill="none"
        markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
        className={cn(
          "transition-all cursor-pointer",
          isSelected ? "text-primary filter drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "text-muted-foreground/30 hover:text-primary/60 hover:stroke-[3.5px]"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(connection.id);
        }}
      />
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(connection.id);
        }}
      />
    </g>
  );
}

