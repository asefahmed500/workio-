'use client';

import { Connection } from '@/types/workflow';
import { getNodeType } from '@/lib/workflow/node-registry';
import { cn } from '@/lib/utils';

interface ConnectionLinesProps {
  connections: Connection[];
  nodePositions: Record<string, { x: number; y: number }>;
  onConnectionClick?: (connectionId: string) => void;
  selectedConnectionId?: string | null;
}

export function ConnectionLines({ connections, nodePositions, onConnectionClick, selectedConnectionId }: ConnectionLinesProps) {
  return (
    <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ pointerEvents: 'none' }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
        </marker>
      </defs>
      {connections.map(conn => (
        <ConnectionLine
          key={conn.id}
          connection={conn}
          nodePositions={nodePositions}
          onClick={onConnectionClick}
          isSelected={selectedConnectionId === conn.id}
        />
      ))}
    </svg>
  );
}

interface ConnectionLineProps {
  connection: Connection;
  nodePositions: Record<string, { x: number; y: number }>;
  onClick?: (connectionId: string) => void;
  isSelected?: boolean;
}

function ConnectionLine({
  connection,
  nodePositions,
  onClick,
  isSelected
}: ConnectionLineProps) {
  const sourceNode = nodePositions[connection.sourceNodeId];
  const targetNode = nodePositions[connection.targetNodeId];

  if (!sourceNode || !targetNode) return null;

  const sourceNodeType = getNodeType(connection.sourceNodeId);
  const targetNodeType = getNodeType(connection.targetNodeId);

  if (!sourceNodeType || !targetNodeType) return null;

  // Calculate port positions
  const nodeWidth = 256;
  const nodeHeaderHeight = 60;
  const portSpacing = 28;
  const portStartOffset = nodeHeaderHeight + 12;

  const sourceOutputIndex = sourceNodeType.outputs.findIndex(o => o.id === connection.sourcePort);
  const targetInputIndex = targetNodeType.inputs.findIndex(i => i.id === connection.targetPort);

  // Source port is on the right side
  const sourceX = sourceNode.x + nodeWidth;
  const sourceY = sourceNode.y + portStartOffset + (sourceOutputIndex * portSpacing);

  // Target port is on the left side
  const targetX = targetNode.x;
  const targetY = targetNode.y + portStartOffset + (targetInputIndex * portSpacing);

  // Create bezier curve
  const dx = targetX - sourceX;
  const controlOffset = Math.max(Math.abs(dx) * 0.5, 50);

  const path = `M ${sourceX} ${sourceY} C ${sourceX + controlOffset} ${sourceY}, ${targetX - controlOffset} ${targetY}, ${targetX - 8} ${targetY}`;

  return (
    <g style={{ pointerEvents: 'stroke' }} className="group/connection">
      <path
        d={path}
        stroke={isSelected ? "hsl(var(--primary))" : "currentColor"}
        strokeWidth={isSelected ? "3" : "2"}
        fill="none"
        markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
        className={cn(
          "transition-all cursor-pointer",
          isSelected ? "text-primary" : "text-muted-foreground hover:text-primary hover:stroke-[3px]"
        )}
        onClick={() => onClick?.(connection.id)}
      />
      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="cursor-pointer"
        onClick={() => onClick?.(connection.id)}
      />
    </g>
  );
}
