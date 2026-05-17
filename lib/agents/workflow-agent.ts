import { ToolLoopAgent, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { emailTool } from "./tools/email";
import { httpTool } from "./tools/http";
import { slackTool } from "./tools/slack";
import { databaseTool } from "./tools/database";

export const workflowAgent = new ToolLoopAgent({
  model: openai("gpt-4o"),
  instructions: `You are a workflow automation agent. Your job is to execute workflows by calling the appropriate tools in sequence.

A workflow consists of connected nodes. Each node has a type and parameters. You should:
1. Parse the workflow definition (nodes and connections)
2. Execute each node in order, following the connections
3. Pass data between nodes as needed
4. Report the result of each step

Available tools:
- email: Send emails via Resend
- http: Make HTTP requests to external APIs
- slack: Send messages to Slack channels
- database: Query the application database

Always report your progress step by step. If a step fails, report the error and continue if possible.`,
  tools: {
    email: emailTool,
    http: httpTool,
    slack: slackTool,
    database: databaseTool,
  },
});

export type WorkflowInput = {
  workflowId: string;
  nodes: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
  }>;
  connections: Array<{
    sourceNodeId: string;
    targetNodeId: string;
  }>;
  input: Record<string, unknown>;
};
