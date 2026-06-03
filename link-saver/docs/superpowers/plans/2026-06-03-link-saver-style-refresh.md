# Link Saver Style Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve readability and visual polish across the existing Link Saver UI without changing behavior or data flow.

**Architecture:** Keep the current component structure and logic intact while updating only Tailwind class names and global theme variables. Use `app/globals.css` for the overall light theme and component-level class changes for layout, cards, form controls, badges, and table hierarchy.

**Tech Stack:** Next.js App Router, React, Tailwind CSS v4, global CSS

---

### File Map

- Modify: `app/globals.css` to fix the washed-out theme and establish stronger global colors.
- Modify: `app/page.tsx` to introduce a more polished page shell and card layout.
- Modify: `components/UrlForm.tsx` to improve input, button, and error styling only.
- Modify: `components/StatusBadge.tsx` to refine badge contrast and typography.
- Modify: `components/LinksTable.tsx` to improve empty state, table hierarchy, row styling, and readability.

### Execution Notes

- [ ] Update `app/globals.css` with a stable light theme, stronger foreground color, and a softer page background.
- [ ] Restyle `app/page.tsx` with a clearer hero section and better card surfaces while preserving existing content.
- [ ] Restyle `components/UrlForm.tsx` input, button, and error message classes without changing submit behavior.
- [ ] Restyle `components/StatusBadge.tsx` badge classes for better contrast and consistency.
- [ ] Restyle `components/LinksTable.tsx` table and empty state for better scanability and contrast.
- [ ] Verify with `npm run lint` and `npm run build`.
