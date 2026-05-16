'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNodeType } from '@/lib/workflow/node-registry';
import { GripVertical, Mail, MailOpen, PhoneIncoming, ListTree, Webhook, Clock, Globe, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowNode as WorkflowNodeType } from '@/types/workflow';
import { LucideIcon } from 'lucide-react';
import { Transform } from '@dnd-kit/utilities';
import { ConnectionPort } from './connection-port';

const iconMap: Record<string, LucideIcon> = {
  Mail,
  MailOpen,
  PhoneIncoming,
  ListTree,
  Webhook,
  Clock,
  Globe,
  GitBranch
};

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  selected: boolean;
  onSelect: () => void;
  onDrag?(nodeId: string, transform: Transform): void;
}

export function WorkflowNode({ node, selected, onSelect, onDrag }: WorkflowNodeProps) {
  const nodeType = getNodeType(node.type);
  const Icon = nodeType?.icon ? iconMap[nodeType.icon] : null;

  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: node.id,
    data: {
      source: 'node',
      nodeId: node.id
    }
  });

  // Apply transform while dragging for smooth movement
  const style: React.CSSProperties = {
    left: node.position.x,
    top: node.position.y,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : 1,
  };

  // Add transform if dragging
  if (transform) {
    style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`;
  }

  // Report drag position to parent
  if (onDrag && transform) {
    onDrag(node.id, transform);
  }

  if (!nodeType) return null;

  return (
    <div
      ref={setNodeRef}
      className="absolute"
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <Card
        className={cn(
          "w-64 border-2 transition-all shadow-sm hover:shadow-md",
          selected ? "ring-2 ring-primary shadow-lg" : "",
          nodeType.color === 'blue' && "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20",
          nodeType.color === 'green' && "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20",
          nodeType.color === 'purple' && "border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/20",
          nodeType.color === 'orange' && "border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20",
          nodeType.color === 'yellow' && "border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div
              className="cursor-grab hover:bg-muted rounded p-1 transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            {Icon && <Icon className="h-4 w-4" />}
            <CardTitle className="text-sm flex-1">{nodeType.name}</CardTitle>
            <Badge variant="outline" className="text-xs capitalize">
              {nodeType.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {nodeType.description}
        </CardContent>

        {/* Input ports */}
        {nodeType.inputs.length > 0 && (
          <div className="flex flex-col gap-2 p-2 border-t bg-muted/30">
            {nodeType.inputs.map(port => (
              <div key={port.id} className="flex items-center gap-2">
                <ConnectionPort
                  nodeId={node.id}
                  portId={port.id}
                  portType="input"
                  portName={port.name}
                />
                <span className="text-xs">{port.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Output ports */}
        {nodeType.outputs.length > 0 && (
          <div className="flex flex-col gap-2 p-2 border-t bg-muted/30">
            {nodeType.outputs.map(port => (
              <div key={port.id} className="flex items-center gap-2 justify-end">
                <span className="text-xs">{port.name}</span>
                <ConnectionPort
                  nodeId={node.id}
                  portId={port.id}
                  portType="output"
                  portName={port.name}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
