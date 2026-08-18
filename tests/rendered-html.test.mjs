import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Fernanda Lara storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Fernanda Lara \| Moda, calzado y lotes<\/title>/i);
  assert.match(html, /Detalles que hacen especial tu estilo\./);
  assert.match(html, /href="\/catalogo"/);
  assert.match(html, /href="\/admin"/);
  assert.doesNotMatch(html, /Building your site|Your site is taking shape/);
});

test("keeps sales and photo watermarking connected to the admin", async () => {
  const [storeApp, supabaseService, setupSql] = await Promise.all([
    readFile(new URL("../app/StoreApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../services/supabase.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/setup.sql", import.meta.url), "utf8"),
  ]);

  assert.match(storeApp, /label: "Ventas", path: "\/admin\/ventas"/);
  assert.match(storeApp, /Marca de agua automática: Fernanda Lara/);
  assert.match(storeApp, /context\.fillText\(watermark/);
  assert.match(storeApp, /Ventas de hoy/);
  assert.match(storeApp, /Ventas de la semana/);
  assert.match(storeApp, /Ventas del año/);
  assert.match(storeApp, /const activeCategory = filter \?\? selectedCategory/);
  assert.match(storeApp, /product\.category === activeCategory/);
  assert.match(supabaseService, /export async function saveCloudSale/);
  assert.match(supabaseService, /export async function loadCloudSales/);
  assert.match(setupSql, /create table if not exists public\.sales/);
  assert.match(setupSql, /create table if not exists public\.sale_items/);
  assert.match(setupSql, /alter table public\.sales enable row level security/);
});
