# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- **Type**: Cloudflare Worker web application
- **Framework**: Hono (fast web framework for Cloudflare Workers)
- **Runtime**: Node.js ES modules on Cloudflare Workers runtime
- **Static Assets**: Public directory served via `ASSETS` binding
- **Observability**: Enabled (Cloudflare observability features)

## Development Commands

```bash
npm run dev          # Start local development server (Wrangler)
npm run deploy       # Deploy to Cloudflare with minification
npm run cf-typegen   # Generate/sync types from wrangler.jsonc to worker-configuration.d.ts
```

## Project Structure

```
src/
  index.ts          # Main Hono app entry point
public/             # Static assets served via ASSETS binding
wrangler.jsonc      # Cloudflare Worker configuration
worker-configuration.d.ts  # Auto-generated types for bindings/environment
tsconfig.json       # TypeScript configuration (Hono JSX support)
```

## Key Configuration

**wrangler.jsonc**:
- `main`: Entry point is `src/index.ts`
- `compatibility_date`: Latest (2025-12-02) - controls runtime feature availability
- `assets`: Static files from `./public` bound as `ASSETS`
- `observability`: Enabled for Cloudflare telemetry

**TypeScript**:
- Target: ESNext
- JSX: Configured for `hono/jsx` (import from "hono/jsx")
- Strict mode enabled
- Module resolution: Bundler (for Workers runtime)

## Bindings & Types

- Hono app is typed with `Hono<{ Bindings: CloudflareBindings }>`
- Use `npm run cf-typegen` after modifying `wrangler.jsonc` to regenerate types
- Static assets accessed via `ASSETS` binding (pre-configured)
- For new bindings (KV, D1, AI, etc.), add to `wrangler.jsonc` then regenerate types

## Development Notes

- Hot reload works with `npm run dev` (Wrangler watches file changes)
- Hono routing is request/response based (similar to Express but optimized for Workers)
- Worker runtime has no file system access—use KV storage for persistence
- Environment variables go in `wrangler.jsonc` under `vars` or use `wrangler secret` for sensitive data
- list steps to verify instead of verifying