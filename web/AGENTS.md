# Frontend Guidelines

- Use React 19 with TypeScript strict mode and functional components.
- Use Material UI for accessible interactive controls and Tailwind CSS v4 for layout utilities where useful.
- Keep route-level features in `src/features`, shared UI and formatters in `src/shared`, and application state in `src/state`.
- Prefer explicit domain types; do not introduce `any`.
- Preserve keyboard access, visible focus, labels for inputs, and accessible names for icon-only buttons.
- Run `pnpm test` and `pnpm build` from this directory after frontend changes.