'use client';

import { useState, useCallback } from 'react';
import { Workflow, WorkflowNode, Connection } from '@/types/workflow';

export function useWorkflow() {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: '1',
    name: 'Untitled Workflow',
    nodes: [],
    connections: []
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0, scale: 1 });

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: {}
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setSelectedNodeId(newNode.id);
    setSelectedConnectionId(null);
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === nodeId ? { ...n, ...updates } : n
      )
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(
        c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      )
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [selectedNodeId]);

  const addConnection = useCallback((connection: Connection) => {
    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, connection]
    }));
  }, []);

  const deleteConnection = useCallback((connectionId: string) => {
    setWorkflow(prev => ({
      ...prev,
      connections: prev.connections.filter(c => c.id !== connectionId)
    }));
    if (selectedConnectionId === connectionId) setSelectedConnectionId(null);
  }, [selectedConnectionId]);

  return {
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
  };
}
