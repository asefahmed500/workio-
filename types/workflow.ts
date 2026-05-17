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
  data: Record<string, string | number | boolean | null>;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePort: string;
  sourceSide?: 'top' | 'bottom' | 'left' | 'right';
  targetNodeId: string;
  targetPort: string;
  targetSide?: 'top' | 'bottom' | 'left' | 'right';
}

export interface Position {
  x: number;
  y: number;
}

export interface NodeType {
  id: string;
  category: 'email' | 'call-center' | 'automation' | 'trigger' | 'communication' | 'api' | 'logic' | 'transform' | 'utility' | 'database' | 'ai' | 'issue';
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
