import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminListBookings, adminUpdateBooking } from "@/lib/admin.functions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: BookingsAdmin,
});

const STATUS = ["pending", "confirmed", "cancelled", "completed"] as const;
const PAY = ["unpaid", "deposit_paid", "paid_in_full", "refunded"] as const;

function BookingsAdmin() {
  const list = useServerFn(adminListBookings);
  const update = useServerFn(adminUpdateBooking);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => list() });
  const mut = useMutation({
    mutationFn: (d: any) => update({ data: d }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Error"),
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Bookings</h1>
      {isLoading && <p>Loading…</p>}
      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left text-[11px] tracking-[0.2em] uppercase text-foreground/70">
              <th className="p-3">Guest</th>
              <th className="p-3">Journey</th>
              <th className="p-3">Date</th>
              <th className="p-3">Party</th>
              <th className="p-3">Deposit</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="p-3"><div className="font-medium">{b.guest_name}</div><div className="text-foreground/60 text-xs">{b.guest_email}</div></td>
                <td className="p-3">{b.itinerary_name}</td>
                <td className="p-3">{b.travel_date ?? "—"}</td>
                <td className="p-3">{b.party_size}</td>
                <td className="p-3">${b.deposit_usd}</td>
                <td className="p-3">
                  <Select defaultValue={b.status} onValueChange={(v) => mut.mutate({ id: b.id, status: v })}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Select defaultValue={b.payment_status} onValueChange={(v) => mut.mutate({ id: b.id, payment_status: v })}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAY.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-foreground/60">No bookings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
