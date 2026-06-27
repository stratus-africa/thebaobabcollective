import { createFileRoute } from "@tanstack/react-router";

// Public media proxy — streams files from the private `journal-images`
// Supabase Storage bucket using the admin client. Keeps the bucket private
// while giving uploaded images a stable, public URL we can store in the DB.
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as any)._splat as string | undefined;
        if (!path) return new Response("Not found", { status: 404 });

        // Defense: path is constructed by the admin upload fn as `cms/<ts>-<name>`.
        // Reject traversal attempts.
        if (path.includes("..")) return new Response("Bad path", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("journal-images")
          .download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        const buf = await data.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
