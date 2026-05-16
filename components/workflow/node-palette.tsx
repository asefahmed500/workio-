'use client';

import { useDraggable } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { nodeTypes, getNodeTypesByCategory } from '@/lib/workflow/node-registry';
import { Mail, MailOpen, PhoneIncoming, ListTree, Webhook, Clock, Globe, GitBranch } from 'lucide-react';
import { useState } from 'react';
import { NodeType } from '@/types/workflow';
import { LucideIcon } from 'lucide-react';

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

const categories = [
  { id: 'email', name: 'Email Marketing', color: 'blue' },
  { id: 'call-center', name: 'Call Center', color: 'green' },
  { id: 'automation', name: 'Automation', color: 'purple' }
];

export function NodePalette() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['email', 'call-center', 'automation']));

  const filteredTypes = search
    ? nodeTypes.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      )
    : nodeTypes;

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-2">Nodes</h2>
        <Input
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {categories.map(category => {
            const types = search
              ? filteredTypes.filter(t => t.category === category.id)
              : getNodeTypesByCategory(category.id);

            if (types.length === 0) return null;

            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id}>
                <button
                  onClick={() => {
                    setExpandedCategories(prev => {
                      const next = new Set(prev);
                      if (next.has(category.id)) {
                        next.delete(category.id);
                      } else {
                        next.add(category.id);
                      }
                      return next;
                    });
                  }}
                  className="w-full flex items-center justify-between p-2 hover:bg-muted rounded"
                >
                  <span className="font-medium text-sm">{category.name}</span>
                  <Badge variant="outline">{types.length}</Badge>
                </button>

                {isExpanded && (
                  <div className="ml-2 space-y-1">
                    {types.map(type => (
                      <PaletteNode key={type.id} nodeType={type} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function PaletteNode({ nodeType }: { nodeType: NodeType }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${nodeType.id}`,
    data: {
      source: 'palette',
      nodeType: nodeType.id,
      name: nodeType.name
    }
  });

  const Icon = nodeType.icon ? iconMap[nodeType.icon] : null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
    >
      {Icon && <Icon className="h-4 w-4" />}
      <div className="flex-1">
        <div className="text-sm font-medium">{nodeType.name}</div>
        <div className="text-xs text-muted-foreground truncate">{nodeType.description}</div>
      </div>
    </div>
  );
}
