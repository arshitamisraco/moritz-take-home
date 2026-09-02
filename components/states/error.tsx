"use client";

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
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="t-detail mt-2 w-fit text-foreground underline decoration-border underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
        >
          retry
        </button>
      </div>
    </main>
  );
}
