# Mysil — operations dashboard

A single-page command center for the administrator of a small, flat-fee law
firm. It answers three questions in order: what needs me right now, who is
carrying too much, and is the money holding. The organizing idea is
*exceptions over information*: the page leads with the few matters that can
still go wrong today, and everything else is context beneath them.

Every number and sentence on screen is derived from fixture data by pure
functions. Nothing is typed into a component, so acting on a row recomputes
the whole page from one place.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # vitest, derive-layer tests
pnpm lint
npx tsc --noEmit
```

## Information architecture

Top to bottom, in the order an admin would ask:

1. **Firm at a glance.** Three pillar cards: Firm health, Workload, Financial
   health. Each shows a state (steady / straining / breaking), the count the
   rule fired on, one line of evidence, and one baseline. Each is a link to
   its section.
2. **Needs attention.** The page's h1. One *Act now* card for the single most
   urgent matter, then the at-risk table grouped by time bucket
   (compliance, overdue, next 4 hours, today, this week). Four rows on the
   page; the rest behind View all.
3. **Workload.** One derived verdict sentence, then the bench: every
   over-committed lawyer with a capacity meter whose segments are coloured
   by deadline pressure. Expanding a lawyer lists their matters with a
   Reassign on each movable one. Unassigned matters follow, each with the
   one action that fits its blocker.
4. **Firm pulse.** Seven-day counts of filings, meetings, openings and
   onboardings, then the activity log by day.
5. **Financial health.** Latest month's revenue against target, the revenue
   trend chart, margin by matter type, then the margin shortfall list.

Revenue comes last on purpose. An admin's first question is "what is
broken", not "how much did we bill".

## Pillar rules

From `lib/derive/thresholds.ts`. The tooltip on each desktop badge renders
this same table.

| Pillar | Steady | Straining | Breaking |
| --- | --- | --- | --- |
| Firm health | No breaches, nothing overdue | Matters in final window, or stalled 96h+ | Anything overdue, or work started before conflicts cleared |
| Workload | ≤2 lawyers over committed | 3–8 over committed, or undeclared availability | >8 over committed, or an unplaceable matter past deadline |
| Financial health | All open matters above the 45% margin floor | Any open matter below floor or negative | A delivered matter closed negative |

## Action model

`lib/derive/actions.ts` picks one primary verb per row from its bucket and
blockers (Chase, Expedite clearance, Reassign, Assign, Halt, Escalate); the
rest sit under More. One dispatch into the ledger reducer recomputes every
zone: the Act now card advances, the table row leaves, the pillar count
drops, the activity log gains an entry. Every action shows a toast with
Undo; ⌘Z also undoes. Bulk availability requests collapse into one undoable
step.

## Design system

- **Tokens only.** `app/globals.css` holds primitives (a warm neutral ramp,
  one terracotta accent, one cool mist tint), then shadcn semantic tokens
  that reference them, then the Tailwind theme. No component writes a
  colour, radius or font by value.
- **Type roles.** Eight `.t-*` classes, three faces: Newsreader for names
  and prose, IBM Plex Sans for explanation, IBM Plex Mono for figures and
  machine tags. Components never set a font size or weight directly.
- **One accent.** Terracotta appears only for a true breaking state. Steady
  is the pastel mist, straining a pale sand. Hover is one flat wash step;
  nothing tints on hover.
- **shadcn/ui** (base-nova style on Base UI): Card, Alert, Badge, Button,
  Table, Collapsible, DropdownMenu, Dialog, Tooltip, Command, Chart,
  Sonner. `StatusBadge` wraps Badge with a state variant rather than
  editing the primitive.
- **Motion.** One entrance (blocks rise 8px and fade in, staggered) and one
  swap (the Act now card slides out and the next one in). Respects
  `prefers-reduced-motion`. Nothing else moves.
- **No dark mode**, deliberately. A half-styled dark theme toggled once in a
  demo is worse than none.

## Trade-offs

- Desktop and mobile are two mounted trees (`components/desktop`,
  `components/mobile`) switched at `md`. It doubles some markup but lets
  the phone view be a different composition, not a squeezed desktop.
- Charts are desktop-only. Mobile gets the same figures and facts as text.
- Session state lives in a reducer, not a backend. Reload resets it.
