/**
 * "5/3" — committed over declared, denominator one ink step down. Ratios
 * like this are the only place a fraction renders on the page, so the
 * convention lives here once rather than being reformatted per call site.
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
    <span className="t-detail tabular-nums">
      <span className="text-foreground">{committed}</span>
      <span className="text-muted-foreground">/{declared}</span>
    </span>
  );
}
