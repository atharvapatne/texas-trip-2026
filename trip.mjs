// Tiny shared "board" for the trip site, stored in Netlify Blobs (free tier).
// GET    /api/trip?col=awards              -> { id: {...}, ... }
// POST   /api/trip   {col, id, data}       -> saves one document
// DELETE /api/trip?col=songs&id=s123    -> removes one document
import { getStore } from "@netlify/blobs";

const COLS = new Set(["legs", "host", "menu", "preds", "awards", "songs", "journal"]);
const ID = /^[A-Za-z0-9_-]{1,60}$/;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const store = getStore("trip");
  const url = new URL(req.url);
  try {
    if (req.method === "GET") {
      const col = url.searchParams.get("col");
      if (!COLS.has(col)) return json({ error: "bad collection" }, 400);
      const { blobs } = await store.list({ prefix: col + "/" });
      const out = {};
      await Promise.all(blobs.map(async (b) => {
        const v = await store.get(b.key, { type: "json" });
        if (v) out[b.key.slice(col.length + 1)] = v;
      }));
      return json(out);
    }
    if (req.method === "POST") {
      const raw = await req.text();
      if (raw.length > 20000) return json({ error: "too large" }, 413);
      const { col, id, data } = JSON.parse(raw);
      if (!COLS.has(col) || !ID.test(id || "") || typeof data !== "object" || data === null) return json({ error: "bad request" }, 400);
      await store.setJSON(col + "/" + id, data);
      return json({ ok: true });
    }
    if (req.method === "DELETE") {
      const col = url.searchParams.get("col"), id = url.searchParams.get("id");
      if (!COLS.has(col) || !ID.test(id || "")) return json({ error: "bad request" }, 400);
      await store.delete(col + "/" + id);
      return json({ ok: true });
    }
    return json({ error: "method not allowed" }, 405);
  } catch (e) {
    return json({ error: "server error" }, 500);
  }
};

export const config = { path: "/api/trip" };
