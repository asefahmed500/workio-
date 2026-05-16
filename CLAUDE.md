# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is a Next.js 16 application using the App Router with shadcn/ui components and Tailwind CSS v4.

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

## Key Patterns

- Use `cn()` from `@/lib/utils` to merge Tailwind classes (combines `clsx` + `tailwind-merge`)
- Import UI components from `@/components/ui/*` — these are generated/managed by shadcn CLI
- Add new shadcn components with `npx shadcn@latest add <component-name>`
- Components use Radix UI primitives with class-variance-authority for variant styling
