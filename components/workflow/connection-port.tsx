'use client';

import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface ConnectionPortProps {
  nodeId: string;
  portId: string;
  portType: 'input' | 'output';
  portName: string;
}

export function ConnectionPort({ nodeId, portId, portType, portName }: ConnectionPortProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `port-${nodeId}-${portId}`,
    data: {
      source: 'port',
      nodeId,
      portId,
      portType,
      portName
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "relative group/port",
        portType === 'output' && "cursor-crosshair"
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2 transition-all duration-200",
          "bg-background shadow-sm",
          portType === 'output' && [
            "border-green-500 group-hover/port:bg-green-500 group-hover/port:scale-125 group-hover/port:shadow-lg",
            isDragging && "bg-green-500 scale-125 shadow-lg ring-2 ring-green-300"
          ],
          portType === 'input' && [
            "border-blue-500 group-hover/port:bg-blue-500 group-hover/port:scale-125 group-hover/port:shadow-lg",
            isDragging && "bg-blue-500 scale-125 shadow-lg ring-2 ring-blue-300"
          ]
        )}
      />
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-md whitespace-nowrap opacity-0 group-hover/port:opacity-100 transition-opacity pointer-events-none z-50">
        {portName} ({portType})
      </div>
    </div>
  );
}
