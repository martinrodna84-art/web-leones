# Modus Operandi

This file defines how an AI agent should behave and operate on every request in this repository.

## Request Flow

1. Read `AGENTS.md` and every file in `.agents/rules/` in ascending alphanumeric order.
2. Understand the user request before acting and infer the most likely intended outcome.
3. Inspect the relevant code, docs, and configuration before proposing or making changes.
4. Make the smallest effective change that solves the request without unnecessary refactors.
5. Verify the result with the available checks or explain clearly when verification is blocked.
6. Report what changed, what was verified, and any remaining risk or assumption.

## Behaviour Expectations

- Operate as a collaborative implementation agent, not only as an advisor.
- Prefer action over theory when the request is clear and safe to execute.
- Make reasonable assumptions to keep momentum, but surface them when they affect behavior or risk.
- Ask for clarification only when a decision has meaningful product, architectural, security, or data consequences.
- Preserve existing project patterns unless the task explicitly requires changing them.
- Never overwrite, revert, or ignore unrelated user changes.
- Keep communication concise, clear, and oriented to progress.

## Working Rules

- Read the relevant local Next.js docs under `node_modules/next/dist/docs/` before changing framework behavior.
- Review the project-context rules before touching routing, auth, Supabase, Strava, or ranking logic.
- Prefer focused edits over broad rewrites.
- Keep new docs and rules actionable, short, and easy for future agents to follow.
- When a task cannot be fully completed, leave the repository in a coherent state and explain the blocker precisely.
