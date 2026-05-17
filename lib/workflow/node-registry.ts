import { NodeType } from '@/types/workflow';

export const nodeTypes: NodeType[] = [
  // ─── Triggers ──────────────────────────────────────────────────────
  {
    id: 'trigger-webhook',
    category: 'trigger',
    name: 'Webhook',
    description: 'Trigger workflow via HTTP webhook',
    icon: 'Webhook',
    color: 'purple',
    inputs: [],
    outputs: [{ id: 'data', name: 'Request Data', type: 'object' }],
    parameters: []
  },
  {
    id: 'trigger-schedule',
    category: 'trigger',
    name: 'Schedule',
    description: 'Trigger workflow on a schedule (cron)',
    icon: 'Clock',
    color: 'purple',
    inputs: [],
    outputs: [{ id: 'tick', name: 'Tick', type: 'any' }],
    parameters: [
      { id: 'cron', name: 'Cron Expression', type: 'text', required: true, description: 'e.g. */5 * * * *' }
    ]
  },

  // ─── Email ─────────────────────────────────────────────────────────
  {
    id: 'email-send',
    category: 'email',
    name: 'Send Email',
    description: 'Send an email via Resend',
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
      { id: 'body', name: 'Body', type: 'text', required: true },
      { id: 'from', name: 'From', type: 'text', required: false, description: 'Override sender' }
    ]
  },
  {
    id: 'email-parse',
    category: 'email',
    name: 'Parse Email',
    description: 'Parse incoming email content',
    icon: 'MailOpen',
    color: 'blue',
    inputs: [{ id: 'email', name: 'Email', type: 'any' }],
    outputs: [{ id: 'data', name: 'Parsed Data', type: 'object' }],
    parameters: []
  },

  // ─── Communication ─────────────────────────────────────────────────
  {
    id: 'slack-send',
    category: 'communication',
    name: 'Slack Message',
    description: 'Send a message to Slack channel',
    icon: 'MessageSquare',
    color: 'green',
    inputs: [{ id: 'trigger', name: 'Trigger', type: 'any' }],
    outputs: [
      { id: 'success', name: 'Success', type: 'any' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      { id: 'webhookUrl', name: 'Webhook URL', type: 'text', required: true },
      { id: 'text', name: 'Message', type: 'text', required: true },
      { id: 'channel', name: 'Channel', type: 'text', required: false }
    ]
  },
  {
    id: 'discord-send',
    category: 'communication',
    name: 'Discord Message',
    description: 'Send a message to Discord channel',
    icon: 'Send',
    color: 'green',
    inputs: [{ id: 'trigger', name: 'Trigger', type: 'any' }],
    outputs: [
      { id: 'success', name: 'Success', type: 'any' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      { id: 'webhookUrl', name: 'Webhook URL', type: 'text', required: true },
      { id: 'content', name: 'Content', type: 'text', required: true }
    ]
  },

  // ─── HTTP / API ────────────────────────────────────────────────────
  {
    id: 'action-http',
    category: 'api',
    name: 'HTTP Request',
    description: 'Make an HTTP request to any API',
    icon: 'Globe',
    color: 'orange',
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
          { value: 'PATCH', label: 'PATCH' },
          { value: 'DELETE', label: 'DELETE' }
        ]
      },
      { id: 'url', name: 'URL', type: 'text', required: true },
      { id: 'headers', name: 'Headers (JSON)', type: 'text', required: false },
      { id: 'body', name: 'Body (JSON)', type: 'text', required: false }
    ]
  },
  {
    id: 'action-graphql',
    category: 'api',
    name: 'GraphQL Query',
    description: 'Execute a GraphQL query or mutation',
    icon: 'Database',
    color: 'orange',
    inputs: [{ id: 'trigger', name: 'Trigger', type: 'any' }],
    outputs: [
      { id: 'data', name: 'Data', type: 'object' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      { id: 'endpoint', name: 'Endpoint URL', type: 'text', required: true },
      { id: 'query', name: 'Query', type: 'text', required: true },
      { id: 'variables', name: 'Variables (JSON)', type: 'text', required: false }
    ]
  },

  // ─── Logic ─────────────────────────────────────────────────────────
  {
    id: 'logic-condition',
    category: 'logic',
    name: 'Condition',
    description: 'Branch based on a condition',
    icon: 'GitBranch',
    color: 'yellow',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [
      { id: 'true', name: 'True', type: 'any' },
      { id: 'false', name: 'False', type: 'any' }
    ],
    parameters: [
      { id: 'expression', name: 'Condition Expression', type: 'text', required: true, description: 'e.g. data.status === "active"' }
    ]
  },
  {
    id: 'logic-switch',
    category: 'logic',
    name: 'Switch',
    description: 'Multi-branch routing based on value',
    icon: 'Split',
    color: 'yellow',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [
      { id: 'case1', name: 'Case 1', type: 'any' },
      { id: 'case2', name: 'Case 2', type: 'any' },
      { id: 'default', name: 'Default', type: 'any' }
    ],
    parameters: [
      { id: 'value', name: 'Value to match', type: 'text', required: true },
      { id: 'case1Value', name: 'Case 1 Value', type: 'text', required: true },
      { id: 'case2Value', name: 'Case 2 Value', type: 'text', required: true }
    ]
  },
  {
    id: 'logic-loop',
    category: 'logic',
    name: 'Loop',
    description: 'Iterate over an array of items',
    icon: 'Repeat',
    color: 'yellow',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [
      { id: 'item', name: 'Each Item', type: 'any' },
      { id: 'done', name: 'Complete', type: 'any' }
    ],
    parameters: [
      { id: 'arrayPath', name: 'Array Path', type: 'text', required: true, description: 'e.g. data.items' }
    ]
  },

  // ─── Transform ─────────────────────────────────────────────────────
  {
    id: 'transform-data',
    category: 'transform',
    name: 'Transform Data',
    description: 'Transform or map data between steps',
    icon: 'Settings2',
    color: 'cyan',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }],
    parameters: [
      { id: 'expression', name: 'Transform Expression', type: 'text', required: true, description: 'e.g. ({ ...data, processed: true })' }
    ]
  },
  {
    id: 'transform-filter',
    category: 'transform',
    name: 'Filter',
    description: 'Filter items from an array',
    icon: 'Filter',
    color: 'cyan',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [{ id: 'output', name: 'Filtered', type: 'any' }],
    parameters: [
      { id: 'condition', name: 'Filter Condition', type: 'text', required: true }
    ]
  },

  // ─── Utility ───────────────────────────────────────────────────────
  {
    id: 'action-delay',
    category: 'utility',
    name: 'Delay',
    description: 'Wait before continuing',
    icon: 'Clock',
    color: 'gray',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }],
    parameters: [
      { id: 'duration', name: 'Duration', type: 'text', required: true, default: '5s', description: 'e.g. 5s, 2m, 1h' }
    ]
  },
  {
    id: 'action-log',
    category: 'utility',
    name: 'Log',
    description: 'Log data to execution output',
    icon: 'FileText',
    color: 'gray',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }],
    parameters: [
      { id: 'message', name: 'Message', type: 'text', required: true },
      { id: 'level', name: 'Level', type: 'select', required: true, default: 'info', options: [
        { value: 'info', label: 'Info' },
        { value: 'warn', label: 'Warning' },
        { value: 'error', label: 'Error' }
      ]}
    ]
  },
  {
    id: 'action-error',
    category: 'utility',
    name: 'Throw Error',
    description: 'Stop workflow with an error',
    icon: 'AlertTriangle',
    color: 'red',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [],
    parameters: [
      { id: 'message', name: 'Error Message', type: 'text', required: true }
    ]
  },

  // ─── Database ──────────────────────────────────────────────────────
  {
    id: 'db-query',
    category: 'database',
    name: 'Database Query',
    description: 'Query the application database',
    icon: 'Database',
    color: 'indigo',
    inputs: [{ id: 'trigger', name: 'Trigger', type: 'any' }],
    outputs: [
      { id: 'results', name: 'Results', type: 'array' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      {
        id: 'model',
        name: 'Model',
        type: 'select',
        required: true,
        options: [
          { value: 'User', label: 'User' },
          { value: 'Workflow', label: 'Workflow' },
          { value: 'WorkflowExecution', label: 'WorkflowExecution' },
          { value: 'ApiKey', label: 'ApiKey' }
        ]
      },
      { id: 'where', name: 'Where (JSON)', type: 'text', required: false },
      { id: 'take', name: 'Limit', type: 'text', required: false, default: '20' }
    ]
  },
  {
    id: 'db-create',
    category: 'database',
    name: 'Create Record',
    description: 'Create a new database record',
    icon: 'PlusCircle',
    color: 'indigo',
    inputs: [{ id: 'trigger', name: 'Trigger', type: 'any' }],
    outputs: [
      { id: 'record', name: 'Created Record', type: 'object' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      {
        id: 'model',
        name: 'Model',
        type: 'select',
        required: true,
        options: [
          { value: 'User', label: 'User' },
          { value: 'Workflow', label: 'Workflow' },
          { value: 'WorkflowExecution', label: 'WorkflowExecution' },
          { value: 'ApiKey', label: 'ApiKey' }
        ]
      },
      { id: 'data', name: 'Data (JSON)', type: 'text', required: true }
    ]
  },

  // ─── Call Center ───────────────────────────────────────────────────
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
    description: 'Interactive voice response menu',
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

  // ─── AI ────────────────────────────────────────────────────────────
  {
    id: 'ai-generate',
    category: 'ai',
    name: 'AI Generate',
    description: 'Generate content using AI',
    icon: 'Brain',
    color: 'violet',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [
      { id: 'output', name: 'Generated', type: 'any' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      { id: 'prompt', name: 'Prompt Template', type: 'text', required: true },
      {
        id: 'model',
        name: 'Model',
        type: 'select',
        required: true,
        default: 'gpt-4o',
        options: [
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
          { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' }
        ]
      }
    ]
  },
  {
    id: 'ai-classify',
    category: 'ai',
    name: 'AI Classify',
    description: 'Classify input using AI',
    icon: 'Tags',
    color: 'violet',
    inputs: [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: [
      { id: 'classification', name: 'Classification', type: 'object' },
      { id: 'error', name: 'Error', type: 'any' }
    ],
    parameters: [
      { id: 'categories', name: 'Categories (comma-separated)', type: 'text', required: true },
      { id: 'prompt', name: 'Classification Prompt', type: 'text', required: false }
    ]
  },

  // ─── Issue Tracking ────────────────────────────────────────────────
  {
    id: 'issue-create',
    category: 'issue',
    name: 'Create Issue',
    description: 'Create a new issue or ticket',
    icon: 'Ticket',
    color: 'rose',
    inputs: [{ id: 'trigger', name: 'Trigger', type: 'any' }],
    outputs: [{ id: 'issue', name: 'Issue Data', type: 'object' }],
    parameters: [
      { id: 'title', name: 'Title', type: 'text', required: true },
      { id: 'description', name: 'Description', type: 'text', required: false },
      {
        id: 'priority',
        name: 'Priority',
        type: 'select',
        required: true,
        default: 'medium',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'critical', label: 'Critical' }
        ]
      }
    ]
  },
];

export function getNodeType(id: string): NodeType | undefined {
  return nodeTypes.find(t => t.id === id);
}

export function getNodeTypesByCategory(category: string): NodeType[] {
  return nodeTypes.filter(t => t.category === category);
}

export const categories = [
  { id: 'trigger', name: 'Triggers', color: 'purple' },
  { id: 'email', name: 'Email', color: 'blue' },
  { id: 'communication', name: 'Communication', color: 'green' },
  { id: 'api', name: 'HTTP / API', color: 'orange' },
  { id: 'logic', name: 'Logic', color: 'yellow' },
  { id: 'transform', name: 'Transform', color: 'cyan' },
  { id: 'utility', name: 'Utility', color: 'gray' },
  { id: 'database', name: 'Database', color: 'indigo' },
  { id: 'ai', name: 'AI', color: 'violet' },
  { id: 'call-center', name: 'Call Center', color: 'green' },
  { id: 'issue', name: 'Issue Tracking', color: 'rose' },
];
