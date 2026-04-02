# AI Agent Entry Point

This file is the mandatory entry point for any AI agent working in this repository.

Before planning, editing, or reviewing code:
1. Read this file first.
2. Read every Markdown file in `.agents/rules/` in ascending alphanumeric order.
3. Treat `.agents/rules/` as the source of truth for all project-specific agent rules and instructions.
4. If rules conflict, follow the most specific rule for the area you are modifying.
5. Re-read the relevant rule files before making framework, architecture, auth, or data-flow changes.

Rules directory:
- `.agents/rules/00-read-first.md`
- `.agents/rules/05-modus-operandi.md`
- `.agents/rules/10-nextjs.md`
- `.agents/rules/20-project-context.md`

Do not assume the list above is exhaustive. If more rule files are added under `.agents/rules/`, read them too.

Minimum repository expectations:
- Do not assume standard historical Next.js behavior. This project runs on Next.js `16.2.2`.
- Read the relevant local guide in `node_modules/next/dist/docs/` before changing Next.js behavior, APIs, conventions, or file structure.
- Preserve the App Router and Supabase SSR architecture unless the task explicitly requires changing it.
