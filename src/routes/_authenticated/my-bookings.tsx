import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getMyBookings } from "@/lib/bookings.functions";

export const Route = createFileRoute("/_authenticated/my-bookings")({
  head: () => ({ meta: [{ title: "My Bookings — The Baobab Collective" }] }),
  component: MyBookings,
});

function MyBookings() {
  const fn = useServerFn(getMyBookings);
  const { data, isLoading } = useQuery({ queryKey: ["my-bookings"], queryFn: () => fn() });

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl mb-8">My Bookings</h1>
        {isLoading && <p>Loading…</p>}
        {!isLoading && (!data || data.length === 0) && (
          <p className="text-foreground/60">You don't have any bookings yet.</p>
        )}
        <div className="space-y-4">
          {data?.map((b) => (
            <article key={b.id} className="border border-border p-6 bg-cream">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl mb-1">{b.itinerary_name}</h2>
                  <p className="text-sm text-foreground/70">
                    {b.travel_date ?? "Date TBC"} · {b.party_size} guest(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-gold">{b.status}</p>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mt-1">Payment: {b.payment_status}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
