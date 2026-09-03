"use client";

import { Button } from "@/components/ui/button";

export function ErrorState() {
  return (
    <main className="mx-auto max-w-[1200px] px-6">
      <header className="flex items-center justify-between border-b border-border py-4">
        <p className="t-section">Mysil</p>
      </header>

      <div className="flex flex-col gap-2 py-16">
        <p className="t-eyebrow text-breaking">error</p>
        <p className="t-body">Could not load today&rsquo;s ledger</p>
        <p className="t-detail text-muted-foreground">
          The firm data source didn&rsquo;t respond — nothing shown here is current
        </p>
        <Button variant="outline" className="mt-3 w-fit" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </main>
  );
}
