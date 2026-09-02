# Data — Two Datasets

Hand this to Claude Code alongside the build prompt. Nothing on screen is typed in; everything below is either raw data or derived from it.

---

## Thresholds

State is computed from these, never assigned. Put them in code where they can be read, and surface them in the tooltip.

| Pillar | Steady | Straining | Breaking |
|---|---|---|---|
| **Firm health** | No breaches, nothing overdue | Matters in final window, or matters stalled | Anything overdue, or work started before conflicts cleared |
| **Workload** | ≤2 lawyers over committed | 3–8 over committed, or undeclared availability | >8 over committed, or an unplaceable matter past its deadline |
| **Financial** | All open matters above margin floor | Any open matter below floor or negative | A **delivered** matter closed negative |

### Note on the financial threshold — this resolves gap 28

The earlier spec said a negative open matter was Breaking, and then the card displayed Steady. The rule was wrong, not the display.

An **open** negative matter is still fixable — you can cap scope, reassign, escalate. That's the definition of Straining. A **delivered** matter that closed negative is locked in and unrecoverable, which is Breaking. This is the same leading-versus-lagging logic as everywhere else, applied to money.

Consequence: the demo dataset reads **Breaking / Straining / Straining** rather than one of each. The good-day dataset covers Steady. Correctness over demo convenience.

Margin floor: **45%.**

---

# Dataset A — the demo state

## Lawyers — 38 total, 15 named

Format: committed matters / declared availability this week. `null` = hasn't declared.

**Over committed — 6**

| Name | Office | Load |
|---|---|---|
| Priya Chandra | London | 5/3 |
| Erik Solberg | Oslo | 5/4 |
| James Okafor | SF | 4/3 |
| Marcus Webb | SF | 4/3 |
| Sofia Lindqvist | Oslo | 4/3 |
| Elena Kowalski | London | 4/3 |

**Headroom — 4** (committed at least 2 below declared)

| Name | Office | Load |
|---|---|---|
| Ingrid Haugen | Oslo | 1/4 |
| Anna Reyes | Oslo | 0/2 |
| Tom Bakke | London | 1/3 |
| David Chen | SF | 1/3 |

**Availability undeclared — 5**

| Name | Office | Load |
|---|---|---|
| Henrik Vold | Oslo | 2/null |
| Sarah Mensah | London | 3/null |
| Yusuf Demir | SF | 2/null |
| Kari Lindstrøm | Oslo | 1/null |
| Michael Torres | SF | 3/null |

**Within range — 23 unnamed.** Committed ≤ declared, less than 2 spare.

6 + 4 + 5 + 23 = 38. ✓

## Matters at risk — 11

**Compliance — pinned, no time bucket**

| Matter | Client | Price | Lawyer | Detail |
|---|---|---|---|---|
| Incorporation | Driftwood Analytics | $2,000 | Priya Chandra | Conflicts not cleared, work started |

**Overdue — 2**

| Matter | Client | Price | Lawyer | Kind | Detail |
|---|---|---|---|---|---|
| Series Seed | Ravel Data | $9,500 | Marcus Webb | closing | Closed yesterday, undelivered |
| SAFE | Nimbus Robotics | $1,500 | Priya Chandra | promise | 72h against 48h promised |

**Next 4 hours — 2**

| Matter | Client | Price | Lawyer | Kind | Detail |
|---|---|---|---|---|---|
| MSA | Vantage Health | $3,200 | Erik Solberg | promise | Due 14:00 · margin −8% |
| SAFE | Northwind Labs | $1,500 | Sofia Lindqvist | promise | Due 15:30 |

**Today — 2**

| Matter | Client | Price | Lawyer | Kind | Detail |
|---|---|---|---|---|---|
| Series A | Kestrel Bio | $12,000 | Sofia Lindqvist | closing | Due 18:00 |
| 83(b) filing | Ortolan Labs | $750 | James Okafor | statutory | Due Sep 3 · cannot be extended |

**This week — 4** (the three unassigned are the exception queue)

| Matter | Client | Price | Lawyer | Kind | Detail |
|---|---|---|---|---|---|
| Option grants | Faroe Materials | $950 | — | closing | Due Sep 4 · **unplaced: conflicts pending** |
| Employment agmt | Halden Foods | $1,100 | — | promise | Due Sep 4 · **unplaced: no lawyer with capacity** |
| Financing | Solstice Grid | $11,000 | — | closing | Due Sep 5 · **unplaced: no expertise match** |
| MSA | Aurora Fintech | $3,400 | Marcus Webb | promise | Due Sep 5 · margin 38%, below floor |

## Other matters — for the table and the margin figures

| Matter | Client | Price | Lawyer | Status | Margin |
|---|---|---|---|---|---|
| Incorporation | Summit Robotics | $2,200 | Anna Reyes | open | 64% |
| Financing | Palisade Foods | $8,000 | David Chen | open | 39% ⚠ below floor |
| MSA | Contoso Biotech | $3,000 | Elena Kowalski | open | 42% ⚠ below floor |
| Employment agmt | Halcyon AI | $1,100 | David Chen | open | 68% |
| MSA | Borealis Tech | $3,200 | Yusuf Demir | open | 52% |
| SAFE | Northlight Devices | $1,500 | Ingrid Haugen | delivered on time | 71% |
| Option grant | Fenwick Systems | $950 | Tom Bakke | delivered on time | 60% |
| Incorporation | Meridian Health | $2,000 | Henrik Vold | delivered on time | 64% |
| SAFE | Tidewater | $1,500 | Sarah Mensah | delivered on time | 71% |

Below floor: Vantage Health (−8%), Palisade Foods (39%), Aurora Fintech (38%), Contoso Biotech (42%) = **4 below floor, 1 negative.** ✓

## Aggregates — all derived

| Figure | Value | Where from |
|---|---|---|
| Firm health state | **Breaking** | 2 overdue + 1 conflicts breach |
| On-time delivery | 94% | 150 delivered in 30 days, 9 late |
| On-time target | 98% | |
| Workload state | **Straining** | 6 over committed, 5 undeclared |
| Over committed | 6 of 38 | count |
| Headroom | 4 lawyers | count |
| Financial state | **Straining** | 1 open matter negative |
| Realized margin | 66% | |
| Quoted margin | 68% | |
| Margin target | 65% | |
| At risk | 11 | count |
| Exception queue | 3 unplaced | count |

**Margin by matter type** (firm-wide averages, not just the matters listed): SAFEs 71% · Employment 68% · Incorporations 64% · Option grants 60% · MSAs 52% · Financings 41%

**Revenue, trailing 5 months:** Apr 500k · May 485k · Jun 510k · Jul 495k · Aug 430k (month-to-date). Target 480k/mo.

## Activity feed — includes meetings and onboardings

| Time | Kind | Detail |
|---|---|---|
| 9:52a | conflicts_cleared | Summit Robotics |
| 9:40a | delivered | SAFE — Northlight Devices |
| 9:15a | opened | Series B — Aurora Fintech |
| 9:02a | meeting | Closing call — Kestrel Bio |
| 8:58a | filing_sent | 83(b) — Contoso Biotech |
| 8:40a | onboarding | New client — Palisade Foods |
| 8:22a | reassigned | Vantage Health: Solberg → Kowalski |
| 8:05a | delivered | Option grant — Fenwick Systems |

---

# Dataset B — the good day

Same shape, quiet values. This is the empty state, and it has to look like a considered screen rather than a blank one.

## Pillars

The headline is always a count of things currently wrong — the same number
the threshold rule fired on — so it means the same thing whether the day is
bad or good. Rates move to the baseline line in both datasets.

| Pillar | State | Headline | Baseline | Evidence |
|---|---|---|---|---|
| Firm health | **Steady** | 0 | 99% on-time · target 98% | Nothing overdue · conflicts clear |
| Workload | **Steady** | 1 | 1 of 38 over committed | 11 lawyers with headroom · all availability declared |
| Financial | **Steady** | 0 | realized 69% · quoted 68% · target 65% | All open matters above floor |

## Lawyers

One over committed (Priya Chandra 4/3). Eleven with headroom. Nobody undeclared. The rest within range.

## Matters

Zero at risk. Zero unplaced. Zero compliance flags.

The attention zone shows its empty state — something like *"Nothing needs you right now. 22 matters in flight, all inside their promised windows."* Followed by the next deadline as context, so the zone still carries information: `Next due — Series A · Kestrel Bio, tomorrow 18:00`.

An empty state that says only "All clear" wastes the most valuable space on the page.

## Open matters — 22 in flight, sample

| Matter | Client | Lawyer | Margin |
|---|---|---|---|
| Series A | Kestrel Bio | Sofia Lindqvist | 67% |
| Incorporation | Summit Robotics | Anna Reyes | 64% |
| MSA | Borealis Tech | Yusuf Demir | 52% |
| SAFE | Tidewater | Sarah Mensah | 71% |
| Employment agmt | Halcyon AI | David Chen | 68% |

## Activity

Still populated — the firm is working, it's just working well. Same event kinds, no reassignments, no flags.

---

## Note on the good-day state

Have this reachable in the demo. "Does this still make sense with nothing wrong?" is an obvious question and most dashboard concepts quietly assume a permanent crisis. Being able to switch to it live is worth more than any single visual detail.
