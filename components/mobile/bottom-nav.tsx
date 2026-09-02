"use client";

const ITEMS = [
  { id: "m-top", label: "Overview" },
  { id: "m-attention", label: "Attention" },
  { id: "m-bench", label: "Bench" },
  { id: "m-activity", label: "Activity" },
];

export function MobileBottomNav() {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-background"
    >
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() =>
            item.id === "m-top"
              ? window.scrollTo({ top: 0 })
              : document.getElementById(item.id)?.scrollIntoView({ block: "start" })
          }
          className="t-eyebrow flex-1 py-3 text-center text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
