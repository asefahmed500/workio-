'use client';

import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNodeType } from '@/lib/workflow/node-registry';
import { GripVertical, Mail, MailOpen, PhoneIncoming, ListTree, Webhook, Clock, Globe, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowNode as WorkflowNodeType } from '@/types/workflow';
import { LucideIcon } from 'lucide-react';
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
  isDragging?: boolean;
}

// Helper function to determine port side based on index and port type
function getPortSide(
  index: number,
  totalPorts: number,
  portType: 'input' | 'output'
): 'top' | 'bottom' | 'left' | 'right' {
  if (portType === 'input') {
    if (index === 0) return 'left';
    if (index === 1) return 'top';
    return 'top'; // Additional inputs go on top
  } else {
    if (index === 0) return 'right';
    if (index === 1) return 'bottom';
    if (index === 2) return 'top';
    return 'bottom'; // Additional outputs go on bottom
  }
}

export const WorkflowNode = memo(function WorkflowNode({ node, selected, onSelect, isDragging = false }: WorkflowNodeProps) {
  const nodeType = getNodeType(node.type);
  const Icon = nodeType?.icon ? iconMap[nodeType.icon] : null;
  const GRID_SIZE = 20;

  const { attributes, listeners, setNodeRef, transform, isDragging: isActuallyDragging } = useDraggable({
    id: node.id,
    data: {
      source: 'node',
      nodeId: node.id
    }
  });


  const effectiveDragging = isDragging || isActuallyDragging;

  const style = {
    left: node.position.x,
    top: node.position.y,
    transform: CSS.Translate.toString(transform),
    opacity: effectiveDragging ? 0.6 : 1,
    zIndex: effectiveDragging ? 1000 : 1,
  };

  if (!nodeType) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute transition-shadow duration-200",
        effectiveDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <Card
        className={cn(
          "w-64 border-2 transition-all shadow-sm",
          selected ? "ring-2 ring-primary border-primary shadow-lg" : "hover:border-primary/50",
          nodeType.color === 'blue' && !selected && "border-blue-300/50 dark:border-blue-700/50 bg-blue-50/50 dark:bg-blue-950/20",
          nodeType.color === 'green' && !selected && "border-green-300/50 dark:border-green-700/50 bg-green-50/50 dark:bg-green-950/20",
          nodeType.color === 'purple' && !selected && "border-purple-300/50 dark:border-purple-700/50 bg-purple-50/50 dark:bg-purple-950/20",
          nodeType.color === 'orange' && !selected && "border-orange-300/50 dark:border-orange-700/50 bg-orange-50/50 dark:bg-orange-950/20",
          nodeType.color === 'yellow' && !selected && "border-yellow-300/50 dark:border-yellow-700/50 bg-yellow-50/50 dark:bg-yellow-950/20"
        )}
      >
        <div 
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <CardHeader className="pb-2 select-none">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground/50">
                <GripVertical className="h-4 w-4" />
              </div>
              {Icon && <Icon className="h-4 w-4" />}
              <CardTitle className="text-sm flex-1">{nodeType.name}</CardTitle>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 px-1.5">
                {nodeType.category}
              </Badge>
            </div>
          </CardHeader>
        </div>
        <CardContent className="text-xs text-muted-foreground pb-3 select-none">
          {nodeType.description}
        </CardContent>

        {/* Dynamic Port Rendering */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Render all input ports */}
          {nodeType.inputs.map((input, index) => {
            const side = getPortSide(index, nodeType.inputs.length, 'input');
            return (
              <ConnectionPort
                key={`input-${input.id}`}
                nodeId={node.id}
                portId={input.id}
                portType="input"
                portName={input.name}
                side={side}
                index={index}
                totalPorts={nodeType.inputs.length}
              />
            );
          })}

          {/* Render all output ports */}
          {nodeType.outputs.map((output, index) => {
            const side = getPortSide(index, nodeType.outputs.length, 'output');
            return (
              <ConnectionPort
                key={`output-${output.id}`}
                nodeId={node.id}
                portId={output.id}
                portType="output"
                portName={output.name}
                side={side}
                index={index}
                totalPorts={nodeType.outputs.length}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
});

