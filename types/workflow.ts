export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: Connection[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: Position;
  data: Record<string, any>;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface NodeType {
  id: string;
  category: 'email' | 'call-center' | 'automation';
  name: string;
  description: string;
  icon: string;
  color: string;
  inputs: NodePort[];
  outputs: NodePort[];
  parameters: NodeParameter[];
}

export interface NodePort {
  id: string;
  name: string;
  type: string;
}

export interface NodeParameter {
  id: string;
  name: string;
  type: 'text' | 'select' | 'toggle';
  required: boolean;
  default?: any;
  options?: ParameterOption[];
  description?: string;
}

export interface ParameterOption {
  value: string;
  label: string;
}
