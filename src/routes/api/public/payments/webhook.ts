import { createFileRoute } from "@tanstack/react-router";

// Stripe payments webhook — Lovable connector gateway delivers events here.
// Updates booking payment status when checkout completes.
export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.text();
          let event: any;
          try { event = JSON.parse(body); } catch { return new Response("bad body", { status: 400 }); }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Gateway forwards Stripe events; handle checkout completion + payment failures
          const type = event.type ?? "";
          const obj = event.data?.object ?? {};

          if (type === "transaction.completed" || type === "checkout.session.completed") {
            const bookingId = obj.client_reference_id || obj.metadata?.booking_id;
            if (bookingId) {
              await supabaseAdmin
                .from("bookings")
                .update({
                  payment_status: "deposit_paid",
                  status: "confirmed",
                  stripe_payment_intent: obj.payment_intent ?? null,
                })
                .eq("id", bookingId);
            }
          } else if (type === "transaction.payment_failed" || type === "checkout.session.expired") {
            const bookingId = obj.client_reference_id || obj.metadata?.booking_id;
            if (bookingId) {
              await supabaseAdmin
                .from("bookings")
                .update({ payment_status: "unpaid" })
                .eq("id", bookingId);
            }
          }
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("payments webhook error", e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});
