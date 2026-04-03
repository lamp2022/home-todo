# Backlog

## High Priority

- [ ] **Supabase backend** — Replace localStorage with Supabase (auth, Postgres, realtime sync between devices)
- [ ] **PWA install** — Service worker, manifest.json, offline support
- [ ] **Push notifications** — Deadline reminders via web push

## Medium Priority

- [ ] **Search/filter** — Find tasks by title, especially useful with many tasks
- [ ] **Drag-and-drop reorder** — Manual priority ordering within categories
- [ ] **Task history** — Full completion history, not just last 7 days
- [ ] **Undo delete** — Toast with undo action instead of confirm dialog
- [ ] **Dark mode** — System preference detection + manual toggle

## Low Priority / Polish

- [ ] **Onboarding** — First-run wizard for adding people and categories
- [ ] **Export/import** — JSON backup/restore
- [ ] **Localization** — English support (currently Finnish only)
- [ ] **Accessibility audit** — Screen reader, keyboard navigation, ARIA
- [ ] **Performance** — Virtualized list for 100+ tasks

## Technical Debt

- [ ] **E2E tests** — Playwright for critical flows
- [ ] **CSP headers** — Content Security Policy meta tag
- [ ] **Source maps** — Disable in production build
- [ ] **Error boundary** — React error boundary with recovery UI

## Decided Against (for now)

- Calendar view — Adds complexity, time grouping covers the use case
- Subtasks — Keep flat, simple task model
- Tags — Categories are sufficient
