# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is a workflow automation platform built with Next.js 16, featuring a visual node-based canvas for creating automation workflows.

## Development Commands

- `npm run dev` — Start development server with Turbopack
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint
- `npm run format` — Format code with Prettier
- `npm run typecheck` — Run TypeScript type checking

## Architecture

- **Framework**: Next.js 16 with App Router (app directory)
- **Styling**: Tailwind CSS v4 using `@import` syntax (not PostCSS plugins) with OKLCH color space
- **UI Components**: shadcn/ui (Radix Nova style) using Radix UI primitives
- **Theming**: Dark mode via `next-themes` with custom theme provider. Press `d` to toggle (except when typing in inputs)
- **Path Aliases**: `@/*` maps to root directory
- **Drag & Drop**: @dnd-kit for canvas interactions (node dragging, port connections)

### Workflow System

The app features a visual workflow builder with the following architecture:

**Types & Registry** ([types/workflow.ts](types/workflow.ts), [lib/workflow/node-registry.ts](lib/workflow/node-registry.ts))
- `Workflow`, `WorkflowNode`, `Connection`, `NodeType` interfaces define the data model
- Node registry contains available node types organized by category (email, call-center, automation)
- Each node type defines inputs/outputs and configurable parameters

**State Management** ([hooks/use-workflow.ts](hooks/use-workflow.ts))
- Custom hook manages workflow state: nodes, connections, selection, canvas position
- Provides CRUD operations: `addNode`, `updateNode`, `deleteNode`, `addConnection`, `deleteConnection`
- 20px grid snapping for node positioning

**Canvas Components** ([components/workflow/](components/workflow/))
- `WorkflowCanvas` — Main container with DndContext, handles drag events and coordinate transformation
- `WorkflowNode` — Individual node rendering with input/output ports
- `ConnectionLines` — SVG-based bezier curve connections between nodes
- `NodePalette` — Draggable node type palette
- `PropertiesPanel` — Configuration panel for selected nodes

**Drag Sources**
- `palette` — Dragging new nodes from palette to canvas
- `node` — Moving existing nodes on canvas
- `port` — Creating connections between node ports

## Key Patterns

- Use `cn()` from `@/lib/utils` to merge Tailwind classes (combines `clsx` + `tailwind-merge`)
- Import UI components from `@/components/ui/*` — these are generated/managed by shadcn CLI
- Add new shadcn components with `npx shadcn@latest add <component-name>`
- Components use Radix UI primitives with class-variance-authority for variant styling
- All workflow components are client-side (`'use client'`) due to drag-and-drop requirements
- Icon names from lucide-react are stored as strings in node registry and rendered dynamically
