/**
 * "5/3" — committed over declared, denominator one ink step down. Ratios
 * like this are the only place a fraction renders on the page, so the
 * convention lives here once rather than being reformatted per call site.
 * The slash is decoration; a screen reader hears "5 committed of 3
 * declared", and a pointer gets the same words on hover.
 */
export function LoadRatio({
  committed,
  declared,
}: {
  committed: number;
  declared: number | null;
}) {
  if (declared === null) {
    return <span className="t-detail text-muted-foreground">undeclared</span>;
  }
  return (
    <span className="t-detail tabular-nums" title="committed / declared this week">
      <span className="text-foreground">{committed}</span>
      <span className="sr-only"> committed of </span>
      <span className="text-muted-foreground">
        <span aria-hidden="true">/</span>
        {declared}
      </span>
      <span className="sr-only"> declared</span>
    </span>
  );
}
