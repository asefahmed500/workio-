import { NodeType } from '@/types/workflow';

export const nodeTypes: NodeType[] = [
  // Email Marketing Nodes
  {
    id: 'email-send',
    category: 'email',
    name: 'Send Email',
    description: 'Send an email to recipients',
    icon: 'Mail',
    color: 'blue',
    inputs: [{ id: 'trigger', name: 'Trigger', type: 'any' }],
    outputs: [
      { id: 'success', name: 'Success', type: 'any' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      { id: 'to', name: 'To', type: 'text', required: true },
      { id: 'subject', name: 'Subject', type: 'text', required: true },
      { id: 'body', name: 'Body', type: 'text', required: true }
    ]
  },
  {
    id: 'email-parse',
    category: 'email',
    name: 'Parse Email',
    description: 'Parse incoming email replies',
    icon: 'MailOpen',
    color: 'blue',
    inputs: [{ id: 'email', name: 'Email', type: 'any' }],
    outputs: [{ id: 'data', name: 'Parsed Data', type: 'object' }],
    parameters: []
  },
  // Call Center Nodes
  {
    id: 'call-incoming',
    category: 'call-center',
    name: 'Incoming Call',
    description: 'Trigger on incoming call',
    icon: 'PhoneIncoming',
    color: 'green',
    inputs: [],
    outputs: [{ id: 'call', name: 'Call Data', type: 'object' }],
    parameters: [
      { id: 'phoneNumber', name: 'Phone Number', type: 'text', required: true }
    ]
  },
  {
    id: 'call-ivr',
    category: 'call-center',
    name: 'IVR Menu',
    description: 'Interactive voice response',
    icon: 'ListTree',
    color: 'green',
    inputs: [{ id: 'call', name: 'Call', type: 'any' }],
    outputs: [
      { id: 'option1', name: 'Option 1', type: 'any' },
      { id: 'option2', name: 'Option 2', type: 'any' }
    ],
    parameters: [
      { id: 'message', name: 'Welcome Message', type: 'text', required: true }
    ]
  },
  // Automation Nodes
  {
    id: 'trigger-webhook',
    category: 'automation',
    name: 'Webhook',
    description: 'Trigger via HTTP webhook',
    icon: 'Webhook',
    color: 'purple',
    inputs: [],
    outputs: [{ id: 'data', name: 'Request Data', type: 'object' }],
    parameters: []
  },
  {
    id: 'action-delay',
    category: 'automation',
    name: 'Delay',
    description: 'Wait before continuing',
    icon: 'Clock',
    color: 'orange',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }],
    parameters: [
      { id: 'seconds', name: 'Seconds', type: 'text', required: true, default: '5' }
    ]
  },
  {
    id: 'action-http',
    category: 'automation',
    name: 'HTTP Request',
    description: 'Make an HTTP request',
    icon: 'Globe',
    color: 'purple',
    inputs: [{ id: 'trigger', name: 'Trigger', type: 'any' }],
    outputs: [
      { id: 'response', name: 'Response', type: 'object' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      {
        id: 'method',
        name: 'Method',
        type: 'select',
        required: true,
        default: 'GET',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' }
        ]
      },
      { id: 'url', name: 'URL', type: 'text', required: true }
    ]
  },
  {
    id: 'logic-condition',
    category: 'automation',
    name: 'Condition',
    description: 'Branch based on conditions',
    icon: 'GitBranch',
    color: 'yellow',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [
      { id: 'true', name: 'True', type: 'any' },
      { id: 'false', name: 'False', type: 'any' }
    ],
    parameters: [
      { id: 'condition', name: 'Condition', type: 'text', required: true }
    ]
  }
];

export function getNodeType(id: string): NodeType | undefined {
  return nodeTypes.find(t => t.id === id);
}

export function getNodeTypesByCategory(category: string): NodeType[] {
  return nodeTypes.filter(t => t.category === category);
}
