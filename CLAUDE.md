# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server with hot-reloading (port 3000)
- `npm run build` - Build TypeScript to JavaScript (outputs to `dist/`)
- `npm run start` - Run production build

### Code Quality
- `npm run lint` - Check linting issues
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Check code formatting
- `npm run format:fix` - Auto-format code
- `npm run check` - Run both lint and format checks
- `npm run check:fix` - Fix both linting and formatting issues

### Testing
- No test commands configured yet (Vitest is installed but not set up)

## Architecture Overview

This is a TypeScript-based Hono web application with the following structure:

### Technology Stack
- **Framework**: Hono - lightweight web framework for Edge and Node.js
- **Runtime**: Node.js with ES modules
- **TypeScript**: Strict mode enabled with ESNext target
- **Code Quality**: Biome for linting and formatting
- **Development**: tsx for hot-reloading

### Key Configuration
- **Module System**: ES modules (`"type": "module"`)
- **Build Output**: Compiles to `dist/` directory
- **JSX Support**: Configured for Hono's JSX components
- **Formatting**: Tabs with width 2, double quotes
- **Source Files**: All code in `src/` directory

### Current Structure
- Single entry point at `src/index.ts` with basic HTTP server
- Server runs on port 3000
- No routing separation or middleware layers yet
- Vitest installed but no tests implemented

### Development Patterns
- Use ES module imports/exports
- TypeScript strict mode is enabled - ensure proper typing
- Biome enforces consistent code style automatically
- Hot-reloading enabled in development mode

## References
- https://hono.dev/llms.txt Hono llm.txt

