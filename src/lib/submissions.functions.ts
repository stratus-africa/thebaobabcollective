import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EnquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(5, "Phone number is required").max(40),
  destination: z.string().trim().max(160).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  travel_dates: z.string().trim().max(120).optional().or(z.literal("")),
  adults: z.number().int().min(0).max(50).optional(),
  children: z.number().int().min(0).max(50).optional(),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  trip_type: z.string().trim().max(60).optional().or(z.literal("")),
  accommodation_style: z.string().trim().max(60).optional().or(z.literal("")),
  experiences: z.array(z.string().max(60)).max(20).optional(),
  referral_source: z.string().trim().max(80).optional().or(z.literal("")),
  subscribe_newsletter: z.boolean().optional(),
  source_url: z.string().trim().max(500).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Tell us about your dream journey").max(2000),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EnquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("enquiries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      destination: data.destination || null,
      subject: data.subject || null,
      travel_dates: data.travel_dates || null,
      adults: data.adults ?? null,
      children: data.children ?? null,
      budget: data.budget || null,
      trip_type: data.trip_type || null,
      accommodation_style: data.accommodation_style || null,
      experiences: data.experiences?.length ? data.experiences : null,
      referral_source: data.referral_source || null,
      subscribe_newsletter: data.subscribe_newsletter ?? false,
      source_url: data.source_url || null,
      message: data.message,
    });
    if (error) {
      console.error("submitEnquiry error", error);
      throw new Error("Could not submit enquiry. Please try again.");
    }
    if (data.subscribe_newsletter) {
      await supabaseAdmin
        .from("newsletter_subscribers")
        .insert({ email: data.email.toLowerCase() })
        .then(() => undefined, () => undefined);
    }
    try {
      const { enqueueInternalEmail } = await import("@/lib/email/send-internal.server");
      await enqueueInternalEmail({
        templateName: "enquiry-notification",
        templateData: {
          kind: data.subject ? "Contact" : "Enquiry",
          name: data.name,
          email: data.email,
          phone: data.phone,
          destination: data.destination || undefined,
          subject: data.subject || undefined,
          travelDates: data.travel_dates || undefined,
          adults: data.adults ?? undefined,
          children: data.children ?? undefined,
          budget: data.budget || undefined,
          tripType: data.trip_type || undefined,
          accommodationStyle: data.accommodation_style || undefined,
          experiences: data.experiences,
          referralSource: data.referral_source || undefined,
          sourceUrl: data.source_url || undefined,
          message: data.message,
        },
      });
    } catch (err) {
      console.error("submitEnquiry: email notification failed", err);
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
      if (error.code === "23505") return { ok: true as const, alreadySubscribed: true };
      console.error("subscribeNewsletter error", error);
      throw new Error("Could not subscribe. Please try again.");
    }
    return { ok: true as const, alreadySubscribed: false };
  });
