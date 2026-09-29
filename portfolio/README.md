# Starrboard — fictional interactive demo

School deadlines, reading plans, and personal tasks often live in separate places. Starrboard brings them into a modular command center with a focused daily view.

This standalone demonstration contains invented records for Jordan Demo. It showcases Home, Today, School filters, task capture, task completion, planning dialogs, and rearrangeable widgets. Data changes reset on reload; layout preferences stay in this browser. Dates are intentionally fixed for a repeatable walkthrough.

[Open the live fictional demo](https://starrboard-demo.vercel.app)

## Try locally

Use Node.js 24. Run `npm ci`, then `npm run dev`. Open http://127.0.0.1:3000. No credentials are needed. `npm run build` creates a static website in `out`.

## What is real versus simulated?

The demo's interface and local interactions work. Provider refreshes, planning approval, and automation dialogs are simulations. No Canvas, Google, GitHub, or database connection exists in this release. Do not enter personal information.

The separately operated private application includes dual Canvas imports, custom reading progress, Google Calendar planning, TA and Career workspaces, project milestones, and internal report automations. Those live capabilities are described in the case study; this demo does not reproduce every private workspace.

## Engineering

Next.js, React, TypeScript, and shared design tokens power the interface. The private application separates imported facts from user planning and enforces ownership through server checks and PostgreSQL row-level security. The demo is exported from a source allowlist: private routes, server actions, secrets, database migrations, and Git history are excluded entirely.

See `portfolio/CASE_STUDY.md` for architecture and the demonstration plan. Published with owner approval. All records are fictional. No open-source license has been selected.
