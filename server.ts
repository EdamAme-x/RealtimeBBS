import { serve } from "https://deno.land/std/http/server.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
// @ts-ignore
import { renderToString } from "https://esm.sh/react-dom/server";
import { Index } from "./runtime/index.tsx";

const app = new Hono();

app.get("/", (c) => {
  const html = `<html>${renderToString(Index() as any)}</html>`;
  return c.html(html);
});

app.get(
  "/static/*",
  serveStatic(
    {
      root: "./",
    },
  ),
);

app.notFound((c) => {
  return c.html("404");
});

serve(app.fetch);
