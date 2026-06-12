import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EnquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  destination: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Tell us about your dream journey").max(2000),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EnquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("enquiries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      destination: data.destination || null,
      message: data.message,
    });
    if (error) {
      console.error("submitEnquiry error", error);
      throw new Error("Could not submit enquiry. Please try again.");
    }
    return { ok: true as const };
  });

const NewsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NewsletterSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email.toLowerCase() });
    if (error) {
      // duplicate email — treat as success for UX
      if (error.code === "23505") return { ok: true as const, alreadySubscribed: true };
      console.error("subscribeNewsletter error", error);
      throw new Error("Could not subscribe. Please try again.");
    }
    return { ok: true as const, alreadySubscribed: false };
  });
