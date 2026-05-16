'use client';

import { useWorkflow } from '@/hooks/use-workflow';
import { getNodeType } from '@/lib/workflow/node-registry';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PropertiesPanel() {
  const { workflow, selectedNodeId, updateNode, deleteNode } = useWorkflow();

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);
  const nodeType = selectedNode ? getNodeType(selectedNode.type) : null;

  if (!selectedNode || !nodeType) {
    return (
      <div className="w-72 border-l bg-card flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center p-4">
          Select a node to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-card flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Properties</h2>
        <p className="text-sm text-muted-foreground">{nodeType.name}</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {nodeType.parameters.map(param => (
            <div key={param.id}>
              <Label htmlFor={param.id}>{param.name}</Label>
              {param.type === 'select' ? (
                <Select
                  defaultValue={selectedNode.data[param.id] || param.default}
                  onValueChange={(value) =>
                    updateNode(selectedNode.id, {
                      data: { ...selectedNode.data, [param.id]: value }
                    })
                  }
                >
                  <SelectTrigger id={param.id}>
                    <SelectValue placeholder={`Select ${param.name.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={param.id}
                  defaultValue={selectedNode.data[param.id] || param.default}
                  onChange={(e) =>
                    updateNode(selectedNode.id, {
                      data: { ...selectedNode.data, [param.id]: e.target.value }
                    })
                  }
                  placeholder={param.description}
                />
              )}
            </div>
          ))}

          {nodeType.parameters.length === 0 && (
            <p className="text-sm text-muted-foreground">No parameters for this node.</p>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => deleteNode(selectedNode.id)}
        >
          Delete Node
        </Button>
      </div>
    </div>
  );
}
