"use client";

import { Info, TriangleAlert, CircleAlert } from "lucide-react";
import { Section } from "@/components/desktop/section";
import { StatusBadge } from "@/components/ledger/status-badge";
import { DisclosureRow } from "@/components/ledger/disclosure-row";
import { CapacityMeter, CapacityLegend } from "@/components/ledger/capacity-meter";
import { Collapsible, CollapsiblePanel } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { DeadlinePressure } from "@/lib/derive/bench-load";
import type { VariantProps } from "class-variance-authority";

const TOC = [
  { id: "color", label: "Color" },
  { id: "type", label: "Typography" },
  { id: "radius", label: "Radius" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges" },
  { id: "alerts", label: "Alerts" },
  { id: "forms", label: "Forms" },
  { id: "cards", label: "Cards" },
  { id: "patterns", label: "Patterns" },
  { id: "table", label: "Table" },
];

function Swatch({ name, varName, hex }: { name: string; varName: string; hex?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-20 rounded-lg ring-1 ring-foreground/10"
        style={{ background: `var(${varName})` }}
      />
      <div>
        <p className="t-detail text-foreground">{name}</p>
        <p className="t-eyebrow text-muted-foreground normal-case">
          {varName}
          {hex ? ` ${hex}` : ""}
        </p>
      </div>
    </div>
  );
}

function TypeRow({ cls, sample, spec }: { cls: string; sample: string; spec: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 py-8 first:pt-0 border-t border-border first:border-t-0 md:grid-cols-[200px_1fr] md:items-center">
      <div>
        <code className="t-eyebrow text-ink-2 normal-case">.{cls}</code>
        <p className="t-detail mt-1 text-muted-foreground">{spec}</p>
      </div>
      <p className={cls}>{sample}</p>
    </div>
  );
}

const badgeDemoVariants: NonNullable<VariantProps<typeof badgeVariants>["variant"]>[] = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
];

const buttonDemoVariants = ["default", "outline", "ghost", "destructive", "link"] as const;

const capacitySegments: DeadlinePressure[] = ["overdue", "today", "later", "none", "none"];

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-40">
      <header className="mt-16">
        <p className="t-eyebrow text-muted-foreground">Design system</p>
        <h1 className="t-wordmark mt-3">Mysil</h1>
        <p className="t-section mt-2">Visual styleguide</p>
        <nav aria-label="Sections" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
          {TOC.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="t-detail text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground"
            >
              {t.label}
            </a>
          ))}
        </nav>
      </header>

      <Section id="color" title="Color" first>
        <p className="t-detail text-muted-foreground">Primitives</p>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
          <Swatch name="Paper" varName="--paper" hex="#fbfaf7" />
          <Swatch name="Paper raised" varName="--paper-raised" hex="#ffffff" />
          <Swatch name="n-100" varName="--n-100" hex="#f2efe9" />
          <Swatch name="n-200" varName="--n-200" hex="#e9e4db" />
          <Swatch name="n-300" varName="--n-300" hex="#d8d1c4" />
          <Swatch name="n-400" varName="--n-400" hex="#b7b0a2" />
          <Swatch name="n-500" varName="--n-500" hex="#78716a" />
          <Swatch name="n-600" varName="--n-600" hex="#6b6459" />
          <Swatch name="n-700" varName="--n-700" hex="#514b41" />
          <Swatch name="n-900" varName="--n-900" hex="#1c1a17" />
          <Swatch name="Terracotta" varName="--terracotta" hex="#b1502f" />
          <Swatch name="Terracotta wash" varName="--terracotta-wash" hex="#f3e4dc" />
          <Swatch name="Sand wash" varName="--sand-wash" hex="#efe3d0" />
          <Swatch name="Mist" varName="--mist" hex="#e8eef1" />
        </div>

        <p className="t-detail mt-14 text-muted-foreground">Semantic</p>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
          <Swatch name="Background" varName="--background" />
          <Swatch name="Card" varName="--card" />
          <Swatch name="Primary" varName="--primary" />
          <Swatch name="Secondary" varName="--secondary" />
          <Swatch name="Muted" varName="--muted" />
          <Swatch name="Accent" varName="--accent" />
          <Swatch name="Border" varName="--border" />
          <Swatch name="Ring" varName="--ring" />
          <Swatch name="Destructive" varName="--destructive" />
          <Swatch name="Steady" varName="--steady" />
          <Swatch name="Straining" varName="--straining" />
          <Swatch name="Breaking" varName="--breaking" />
        </div>

        <p className="t-detail mt-14 text-muted-foreground">Charts</p>
        <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-6">
          <Swatch name="chart-1" varName="--chart-1" />
          <Swatch name="chart-2" varName="--chart-2" />
          <Swatch name="chart-3" varName="--chart-3" />
          <Swatch name="chart-4" varName="--chart-4" />
          <Swatch name="chart-5" varName="--chart-5" />
          <Swatch name="chart-fill" varName="--chart-fill" />
        </div>
      </Section>

      <Section id="type" title="Typography">
        <div className="mt-2">
          <TypeRow cls="t-wordmark" sample="Mysil" spec="Serif, 20/24px, 700" />
          <TypeRow cls="t-eyebrow" sample="STEADY · BREACH" spec="Mono, 12px, uppercase" />
          <TypeRow cls="t-detail" sample="The default body copy." spec="Sans, 13px" />
          <TypeRow cls="t-body" sample="Ferro & Vance, LLP" spec="Serif, 15px" />
          <TypeRow cls="t-subhead" sample="Matters due this week" spec="Serif medium, 15px" />
          <TypeRow cls="t-section" sample="Needs attention" spec="Serif, 20px, heading" />
          <TypeRow cls="t-figure" sample="128" spec="Mono, 44px" />
          <TypeRow cls="t-figure-sm" sample="12" spec="Mono, 28px" />
        </div>
      </Section>

      <Section id="radius" title="Radius">
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { name: "sm", css: "var(--radius-sm)", note: "2px" },
            { name: "md", css: "var(--radius-md)", note: "2px, controls" },
            { name: "lg", css: "var(--radius-lg)", note: "3px, default" },
            { name: "xl", css: "var(--radius-xl)", note: "4px, dialogs" },
          ].map((r) => (
            <div key={r.name} className="flex flex-col gap-3">
              <div
                className="h-20 ring-1 ring-foreground/10"
                style={{ borderRadius: r.css, background: "var(--n-200)" }}
              />
              <div>
                <p className="t-detail text-foreground">radius-{r.name}</p>
                <p className="t-eyebrow text-muted-foreground normal-case">{r.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="Buttons">
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {buttonDemoVariants.map((v) => (
            <Button key={v} variant={v}>
              {v[0].toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
        <p className="t-eyebrow mt-10 text-muted-foreground normal-case">Sizes</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button size="xs">XS</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="icon" aria-label="icon">
            <Info />
          </Button>
        </div>
      </Section>

      <Section id="badges" title="Badges">
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {badgeDemoVariants.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </div>
        <p className="t-eyebrow mt-10 text-muted-foreground normal-case">Status</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <StatusBadge variant="steady" />
          <StatusBadge variant="straining" />
          <StatusBadge variant="breaking" />
        </div>
      </Section>

      <Section id="alerts" title="Alerts">
        <div className="mt-6 flex flex-col gap-4">
          <Alert>
            <Info />
            <AlertTitle>Default</AlertTitle>
            <AlertDescription>Chrome for information with no state attached.</AlertDescription>
          </Alert>
          <Alert variant="straining">
            <TriangleAlert />
            <AlertTitle>Straining</AlertTitle>
            <AlertDescription>Urgent, not yet blown.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Breaking</AlertTitle>
            <AlertDescription>Reserved for breaches.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section id="forms" title="Forms">
        <div className="mt-6 grid max-w-sm gap-5">
          <Input placeholder="Search matters" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Invalid" aria-invalid />
          <Textarea placeholder="Notes on this matter" />
        </div>
      </Section>

      <Section id="cards" title="Cards">
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Health</CardTitle>
              <CardDescription>Computed pillar</CardDescription>
              <CardAction>
                <StatusBadge variant="steady" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="t-figure-sm">4</p>
              <p className="t-detail text-muted-foreground">deadlines this week</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Compact card</CardTitle>
              <CardDescription>size sm, tighter spacing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="t-detail text-ink-2">Same shell, less padding.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">
                Action
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section id="patterns" title="Patterns">
        <p className="t-eyebrow text-muted-foreground normal-case">Capacity meter</p>
        <CapacityMeter segments={capacitySegments} declared={4} className="mt-5 max-w-sm rounded-full" />
        <CapacityLegend className="mt-4" />

        <p className="t-eyebrow mt-12 text-muted-foreground normal-case">Disclosure row</p>
        <div className="mt-5 max-w-md rounded-lg ring-1 ring-foreground/10 px-2">
          <Collapsible>
            <DisclosureRow>
              <span className="t-body flex-1">Priya Shah</span>
              <span className="t-detail text-muted-foreground">6 matters</span>
            </DisclosureRow>
            <CollapsiblePanel>
              <p className="t-detail px-2 pb-4 text-muted-foreground">Panel content</p>
            </CollapsiblePanel>
          </Collapsible>
        </div>
      </Section>

      <Section id="table" title="Table">
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Matter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Days open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { matter: "Bellweather v. Osei", status: "breaking" as const, days: 41 },
              { matter: "Nakamura estate", status: "straining" as const, days: 18 },
              { matter: "Copper Ridge lease", status: "steady" as const, days: 6 },
            ].map((row) => (
              <TableRow key={row.matter}>
                <TableCell className="t-body">{row.matter}</TableCell>
                <TableCell>
                  <StatusBadge variant={row.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.days}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Separator className="mt-20" />
      <p className="t-detail mt-8 text-muted-foreground">
        Pulled live from app/globals.css and components/ui.
      </p>
    </div>
  );
}
