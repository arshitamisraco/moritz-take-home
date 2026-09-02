import { Dashboard } from "@/components/dashboard";
import { LoadingState } from "@/components/states/loading";
import { ErrorState } from "@/components/states/error";
import { fixtureFor, parseViewState } from "@/lib/fixture";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ state?: string | string[] }>;
}) {
  const params = await searchParams;
  const state = parseViewState(params.state);
  const fixture = fixtureFor(state);

  if (state === "loading") return <LoadingState />;
  if (state === "error") return <ErrorState />;
  if (!fixture) return <LoadingState />;

  return <Dashboard fixture={fixture} />;
}
