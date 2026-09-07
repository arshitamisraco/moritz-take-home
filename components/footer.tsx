import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-6">
        <p className="t-detail text-muted-foreground">Made by Arshita Misra</p>
        <Link
          href="/styleguide"
          className="t-detail text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground"
        >
          Styleguide
        </Link>
      </div>
    </footer>
  );
}
