import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

/**
 * --muted is the ground, so a filled skeleton would read as a card again —
 * these are hairline-outlined blocks instead, sized to the same rhythm as
 * the loaded page.
 */
function Block({ className }: { className?: string }) {
  return <Skeleton className={`rounded-sm border border-border bg-transparent ${className ?? ""}`} />;
}

export function LoadingState() {
  return (
    <main className="mx-auto max-w-[1200px] px-6">
      <div className="flex items-center justify-between border-b border-border py-4">
        <Block className="h-6 w-16" />
        <Block className="h-8 w-24" />
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-y border-border py-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 px-6 first:pl-0 last:pr-0">
            <Block className="h-4 w-20" />
            <Block className="h-11 w-16" />
            <Block className="h-3 w-32" />
            <Block className="h-3 w-40" />
          </div>
        ))}
      </div>

      <section className="pt-12 pb-12">
        <Block className="h-5 w-24" />
        <Separator className="mt-4" />
        <div className="mt-4 flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2">
              <Block className="h-4 w-64" />
              <Block className="h-4 w-24" />
              <Block className="h-4 w-40" />
              <Block className="h-4 w-20" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
