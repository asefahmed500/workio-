'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface ConnectionPortProps {
  nodeId: string;
  portId: string;
  portType: 'input' | 'output';
  portName: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  index?: number;
  totalPorts?: number;
}

export function ConnectionPort({
  nodeId,
  portId,
  portType,
  portName,
  side,
  index = 0,
  totalPorts = 1
}: ConnectionPortProps) {
  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: `port-${nodeId}-${portId}-${side}`,
    data: {
      source: 'port',
      nodeId,
      portId,
      portType,
      portName,
      side
    }
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `port-drop-${nodeId}-${portId}-${side}`,
    data: {
      source: 'port',
      nodeId,
      portId,
      portType,
      portName,
      side
    }
  });

  const setRefs = (element: HTMLDivElement | null) => {
    setDraggableRef(element);
    setDroppableRef(element);
  };

  // Calculate offset for multiple ports on same side
  const getPortOffset = () => {
    if (totalPorts <= 1) return 0;
    return ((index / (totalPorts - 1)) - 0.5) * (totalPorts - 1) * 24;
  };

  const portOffset = getPortOffset();

  return (
    <div
      ref={setRefs}
      {...attributes}
      {...listeners}
      className={cn(
        "absolute z-50 group/port pointer-events-auto",
        side === 'left' && "-left-2 top-1/2",
        side === 'right' && "-right-2 top-1/2",
        side === 'top' && "left-1/2 -translate-x-1/2 -top-2",
        side === 'bottom' && "left-1/2 -translate-x-1/2 -bottom-2",
        portType === 'output' && "cursor-crosshair"
      )}
      style={{
        // Apply offset for multiple ports on same side
        ...(totalPorts > 1 && {
          transform: (side === 'left' || side === 'right')
            ? `translate(0, calc(-50% + ${portOffset}px))`
            : `translate(calc(-50% + ${portOffset}px), 0)`
        })
      }}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2 transition-all duration-200 shadow-sm",
          "bg-background",
          portType === 'output' ? "border-emerald-500 hover:bg-emerald-500 hover:scale-125" : "border-blue-500 hover:bg-blue-500 hover:scale-125",
          portType === 'output' && isDragging && "bg-emerald-500 scale-125 ring-4 ring-emerald-500/20",
          portType === 'input' && isDragging && "bg-blue-500 scale-125 ring-4 ring-blue-500/20"
        )}
      />
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-md whitespace-nowrap opacity-0 group-hover/port:opacity-100 transition-opacity pointer-events-none z-50">
        {portName} ({portType})
      </div>
    </div>
  );
}
