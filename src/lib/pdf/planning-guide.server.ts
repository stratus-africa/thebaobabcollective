// Server-only Planning Guide PDF generator (uses @react-pdf/renderer).
// Kept in a *.server.ts file so it never ships to the browser bundle.
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.55,
    color: "#23231f",
  },
  cover: {
    padding: 56,
    backgroundColor: "#1f2a24",
    color: "#f6efe1",
    height: "100%",
  },
  coverEyebrow: {
    fontSize: 9,
    letterSpacing: 4,
    color: "#c79849",
    textTransform: "uppercase",
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 44,
    fontFamily: "Times-Roman",
    lineHeight: 1.05,
    marginBottom: 24,
  },
  coverSub: {
    fontSize: 13,
    color: "#f6efe1",
    opacity: 0.85,
    maxWidth: 340,
    lineHeight: 1.55,
  },
  coverFooter: {
    position: "absolute",
    bottom: 56,
    left: 56,
    right: 56,
    fontSize: 9,
    letterSpacing: 3,
    color: "#c79849",
    textTransform: "uppercase",
  },
  sectionEyebrow: {
    fontSize: 9,
    letterSpacing: 3,
    color: "#b3522e",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  h1: {
    fontFamily: "Times-Roman",
    fontSize: 26,
    marginBottom: 14,
    color: "#1f2a24",
  },
  h2: {
    fontFamily: "Times-Roman",
    fontSize: 18,
    marginTop: 22,
    marginBottom: 8,
    color: "#1f2a24",
  },
  body: {
    fontSize: 11,
    marginBottom: 10,
    color: "#3a3a32",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 5,
  },
  bulletDot: {
    width: 12,
    color: "#c79849",
  },
  bulletText: { flex: 1, fontSize: 11, color: "#3a3a32" },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#c79849",
    marginVertical: 18,
    width: 60,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    fontSize: 8,
    letterSpacing: 2,
    color: "#999",
    textTransform: "uppercase",
    textAlign: "center",
  },
  rowGrid: { flexDirection: "row", marginBottom: 14 },
  rowLabel: {
    width: 110,
    fontSize: 9,
    letterSpacing: 2,
    color: "#999",
    textTransform: "uppercase",
  },
  rowValue: { flex: 1, fontSize: 11, color: "#3a3a32" },
});

const Bullet = ({ children }: { children: React.ReactNode }) =>
  React.createElement(View, { style: styles.bullet }, [
    React.createElement(Text, { key: "d", style: styles.bulletDot }, "•"),
    React.createElement(Text, { key: "t", style: styles.bulletText }, children as any),
  ]);

const Footer = (label: string) =>
  React.createElement(
    Text,
    { style: styles.footer, fixed: true },
    `The Baobab Collective  ·  ${label}`,
  );

export type PlanningGuideContext = {
  name: string;
  interests: string[];
  travellingParty?: string | null;
  earliestDate?: string | null;
};

function buildDoc(ctx: PlanningGuideContext) {
  const interestsLine = ctx.interests.length ? ctx.interests.join(" · ") : "Open to inspiration";

  return React.createElement(
    Document,
    {
      title: "Your Africa Planning Guide",
      author: "The Baobab Collective",
      subject: "Planning Guide",
    },
    [
      // COVER
      React.createElement(
        Page,
        { key: "p1", size: "A4", style: styles.cover },
        [
          React.createElement(Text, { key: 1, style: styles.coverEyebrow }, "The Baobab Collective"),
          React.createElement(Text, { key: 2, style: styles.coverTitle }, "Your Africa\nPlanning Guide"),
          React.createElement(
            Text,
            { key: 3, style: styles.coverSub },
            `Prepared for ${ctx.name}. A short field manual for designing your first — or your next — bespoke safari journey.`,
          ),
          React.createElement(Text, { key: 4, style: styles.coverFooter }, "Curated · Private · Conservation-led"),
        ],
      ),

      // PERSONALISED
      React.createElement(
        Page,
        { key: "p2", size: "A4", style: styles.page },
        [
          React.createElement(Text, { key: 1, style: styles.sectionEyebrow }, "Your Brief"),
          React.createElement(Text, { key: 2, style: styles.h1 }, "Where we begin"),
          React.createElement(View, { key: 3, style: styles.divider }),
          React.createElement(View, { key: 4, style: styles.rowGrid }, [
            React.createElement(Text, { key: "l", style: styles.rowLabel }, "Traveller"),
            React.createElement(Text, { key: "v", style: styles.rowValue }, ctx.name),
          ]),
          React.createElement(View, { key: 5, style: styles.rowGrid }, [
            React.createElement(Text, { key: "l", style: styles.rowLabel }, "Party"),
            React.createElement(Text, { key: "v", style: styles.rowValue }, ctx.travellingParty || "To be confirmed"),
          ]),
          React.createElement(View, { key: 6, style: styles.rowGrid }, [
            React.createElement(Text, { key: "l", style: styles.rowLabel }, "Earliest"),
            React.createElement(Text, { key: "v", style: styles.rowValue }, ctx.earliestDate || "Flexible"),
          ]),
          React.createElement(View, { key: 7, style: styles.rowGrid }, [
            React.createElement(Text, { key: "l", style: styles.rowLabel }, "Interests"),
            React.createElement(Text, { key: "v", style: styles.rowValue }, interestsLine),
          ]),
          React.createElement(Text, { key: 8, style: styles.h2 }, "How we'll work together"),
          React.createElement(
            Text,
            { key: 9, style: styles.body },
            "Within 24 hours of your enquiry we'll share a first sketch — a 1-page draft route with two or three lodges to react to. From there we refine across one or two calls until the itinerary feels exactly right. Nothing is locked until you say so.",
          ),
          Footer("Planning Guide  ·  1"),
        ],
      ),

      // WHEN TO GO
      React.createElement(
        Page,
        { key: "p3", size: "A4", style: styles.page },
        [
          React.createElement(Text, { key: 1, style: styles.sectionEyebrow }, "When to go"),
          React.createElement(Text, { key: 2, style: styles.h1 }, "Africa, season by season"),
          React.createElement(View, { key: 3, style: styles.divider }),
          React.createElement(Text, { key: 4, style: styles.h2 }, "Dry season (June – October)"),
          React.createElement(
            Text,
            { key: 5, style: styles.body },
            "Wildlife concentrates around water; visibility is at its peak. Best for first-time safari travellers and the Great Migration river crossings.",
          ),
          React.createElement(Text, { key: 6, style: styles.h2 }, "Green season (November – April)"),
          React.createElement(
            Text,
            { key: 7, style: styles.body },
            "Lush landscapes, dramatic skies, predator pup season and remarkable birdlife. Lower rates and quieter camps reward repeat travellers.",
          ),
          React.createElement(Text, { key: 8, style: styles.h2 }, "Shoulder windows"),
          React.createElement(
            Text,
            { key: 9, style: styles.body },
            "May and early November offer the rare combination of low traveller density, soft light and full lodges in best form.",
          ),
          Footer("Planning Guide  ·  2"),
        ],
      ),

      // SAMPLE BUDGETS
      React.createElement(
        Page,
        { key: "p4", size: "A4", style: styles.page },
        [
          React.createElement(Text, { key: 1, style: styles.sectionEyebrow }, "Sample budgets"),
          React.createElement(Text, { key: 2, style: styles.h1 }, "What a journey invests in"),
          React.createElement(View, { key: 3, style: styles.divider }),
          React.createElement(Text, { key: 4, style: styles.h2 }, "Classic (from $9,500 pp)"),
          Bullet({ children: "7–9 nights, single country, 2–3 camps." }),
          Bullet({ children: "Senior guide, all meals & drinks, internal flights." }),
          Bullet({ children: "Conservation contribution embedded in every stay." }),
          React.createElement(Text, { key: 5, style: styles.h2 }, "Signature (from $14,500 pp)"),
          Bullet({ children: "10–12 nights across two countries; private vehicle." }),
          Bullet({ children: "One landmark experience: gorilla trek, balloon, helicopter." }),
          React.createElement(Text, { key: 6, style: styles.h2 }, "Bespoke Estate (from $28,000 pp)"),
          Bullet({ children: "Exclusive-use villas & mobile camps." }),
          Bullet({ children: "Private chef, private aircraft, custom routing." }),
          Footer("Planning Guide  ·  3"),
        ],
      ),

      // PACKING + CONSERVATION
      React.createElement(
        Page,
        { key: "p5", size: "A4", style: styles.page },
        [
          React.createElement(Text, { key: 1, style: styles.sectionEyebrow }, "Field notes"),
          React.createElement(Text, { key: 2, style: styles.h1 }, "How to pack & travel light"),
          React.createElement(View, { key: 3, style: styles.divider }),
          Bullet({ children: "Soft duffle (no wheels) — bush-flight luggage limits apply." }),
          Bullet({ children: "Layers in muted greens, taupe and stone — never bright white." }),
          Bullet({ children: "Binoculars (8x42 ideal), sun hat, headlamp, mosquito-spray." }),
          Bullet({ children: "Camera with a 100–400mm zoom and a fast prime for camp." }),
          Bullet({ children: "Cash in small USD denominations for community tips." }),
          React.createElement(Text, { key: 4, style: styles.h2 }, "Conservation"),
          React.createElement(
            Text,
            { key: 5, style: styles.body },
            "We only work with operators that demonstrably reinvest in their landscapes — from anti-poaching to community schools. Your stay funds the rangers who keep wilderness wild.",
          ),
          Footer("Planning Guide  ·  4"),
        ],
      ),

      // CONTACT
      React.createElement(
        Page,
        { key: "p6", size: "A4", style: styles.page },
        [
          React.createElement(Text, { key: 1, style: styles.sectionEyebrow }, "Next step"),
          React.createElement(Text, { key: 2, style: styles.h1 }, "Let's design your journey"),
          React.createElement(View, { key: 3, style: styles.divider }),
          React.createElement(
            Text,
            { key: 4, style: styles.body },
            "When you're ready to begin, reply to the email this guide arrived with — or write to hello@stratus.africa with the dates and feelings you want to chase. We'll respond within 24 hours with a first sketch.",
          ),
          React.createElement(Text, { key: 5, style: styles.h2 }, "The Baobab Collective"),
          React.createElement(Text, { key: 6, style: styles.body }, "hello@stratus.africa"),
          React.createElement(Text, { key: 7, style: styles.body }, "Curated journeys across Africa, designed slowly."),
          Footer("Planning Guide  ·  5"),
        ],
      ),
    ],
  );
}

export async function renderPlanningGuidePdf(ctx: PlanningGuideContext): Promise<Buffer> {
  const doc = buildDoc(ctx);
  return await renderToBuffer(doc as any);
}
