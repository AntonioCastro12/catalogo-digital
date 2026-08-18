import { createClient } from "@supabase/supabase-js";
import type { Product, Sale } from "../app/StoreApp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

type ProductRow = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: Product["category"];
  subcategory: string | null;
  price: number | string;
  previous_price: number | string | null;
  is_offer: boolean;
  available: boolean;
  sizes: string[] | null;
  colors: string[] | null;
  pieces: number | null;
  lot_contents: string[] | null;
  product_images?: Array<{ image_url: string; position: number }>;
};

type SaleRow = {
  id: string;
  sold_at: string;
  customer_name: string | null;
  notes: string | null;
  total: number | string;
  sale_items?: Array<{
    product_id: number | null;
    product_name: string;
    product_code: string;
    quantity: number;
    unit_price: number | string;
  }>;
};

const requireClient = () => {
  if (!supabase) throw new Error("Supabase todavía no está configurado.");
  return supabase;
};

const mapProduct = (row: ProductRow): Product => ({
  id: Number(row.id),
  code: row.code,
  name: row.name,
  description: row.description ?? "",
  category: row.category,
  subcategory: row.subcategory ?? "",
  price: Number(row.price),
  previousPrice: row.previous_price == null ? undefined : Number(row.previous_price),
  isOffer: row.is_offer,
  available: row.available,
  sizes: row.sizes ?? [],
  colors: row.colors ?? [],
  pieces: row.pieces ?? undefined,
  lotContents: row.lot_contents ?? undefined,
  images: (row.product_images ?? [])
    .sort((a, b) => a.position - b.position)
    .map((image) => image.image_url),
});

export async function loadCloudProducts(): Promise<Product[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("products")
    .select("*, product_images(image_url, position)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

const storagePathFromUrl = (url: string) => {
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
};

async function uploadDataImage(productId: number, dataUrl: string) {
  const client = requireClient();
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const path = `products/${productId}/${crypto.randomUUID()}.jpg`;
  const { error } = await client.storage
    .from("product-images")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  const { data } = client.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function saveCloudProduct(product: Product): Promise<Product> {
  const client = requireClient();
  const { data: oldImages, error: oldImagesError } = await client
    .from("product_images")
    .select("image_url, storage_path")
    .eq("product_id", product.id);
  if (oldImagesError) throw oldImagesError;

  const { error: productError } = await client.from("products").upsert({
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    price: product.price,
    previous_price: product.previousPrice ?? null,
    is_offer: product.isOffer,
    available: product.available,
    sizes: product.sizes,
    colors: product.colors,
    pieces: product.pieces ?? null,
    lot_contents: product.lotContents ?? null,
  });
  if (productError) throw productError;

  const resolvedImages: Array<{ url: string; path: string | null }> = [];
  for (const image of product.images) {
    if (image.startsWith("data:")) resolvedImages.push(await uploadDataImage(product.id, image));
    else resolvedImages.push({ url: image, path: storagePathFromUrl(image) });
  }

  const { error: deleteRowsError } = await client
    .from("product_images")
    .delete()
    .eq("product_id", product.id);
  if (deleteRowsError) throw deleteRowsError;

  const { error: imageRowsError } = await client.from("product_images").insert(
    resolvedImages.map((image, position) => ({
      product_id: product.id,
      image_url: image.url,
      storage_path: image.path,
      position,
    })),
  );
  if (imageRowsError) throw imageRowsError;

  const retained = new Set(resolvedImages.map((image) => image.path).filter(Boolean));
  const removedPaths = (oldImages ?? [])
    .map((image) => image.storage_path as string | null)
    .filter((path): path is string => Boolean(path && !retained.has(path)));
  if (removedPaths.length) await client.storage.from("product-images").remove(removedPaths);

  return { ...product, images: resolvedImages.map((image) => image.url) };
}

export async function deleteCloudProduct(productId: number) {
  const client = requireClient();
  const { data: images, error: imageError } = await client
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);
  if (imageError) throw imageError;
  const paths = (images ?? [])
    .map((image) => image.storage_path as string | null)
    .filter((path): path is string => Boolean(path));
  const { error } = await client.from("products").delete().eq("id", productId);
  if (error) throw error;
  if (paths.length) await client.storage.from("product-images").remove(paths);
}

export async function updateCloudProductFlags(
  productId: number,
  values: { available?: boolean; isOffer?: boolean },
) {
  const client = requireClient();
  const payload: Record<string, boolean> = {};
  if (values.available !== undefined) payload.available = values.available;
  if (values.isOffer !== undefined) payload.is_offer = values.isOffer;
  const { error } = await client.from("products").update(payload).eq("id", productId);
  if (error) throw error;
}

const mapSale = (row: SaleRow): Sale => ({
  id: row.id,
  soldAt: row.sold_at,
  customerName: row.customer_name ?? "",
  notes: row.notes ?? "",
  total: Number(row.total),
  items: (row.sale_items ?? []).map((item) => ({
    productId: item.product_id,
    name: item.product_name,
    code: item.product_code,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
  })),
});

export async function loadCloudSales(): Promise<Sale[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("sales")
    .select("id, sold_at, customer_name, notes, total, sale_items(product_id, product_name, product_code, quantity, unit_price)")
    .order("sold_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as SaleRow[]).map(mapSale);
}

export async function saveCloudSale(sale: Sale): Promise<Sale> {
  const client = requireClient();
  const { error: saleError } = await client.from("sales").insert({
    id: sale.id,
    sold_at: sale.soldAt,
    customer_name: sale.customerName || null,
    notes: sale.notes || null,
    total: sale.total,
  });
  if (saleError) throw saleError;

  const { error: itemsError } = await client.from("sale_items").insert(
    sale.items.map((item) => ({
      sale_id: sale.id,
      product_id: item.productId,
      product_name: item.name,
      product_code: item.code,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  );
  if (itemsError) {
    await client.from("sales").delete().eq("id", sale.id);
    throw itemsError;
  }
  return sale;
}

export async function deleteCloudSale(saleId: string) {
  const client = requireClient();
  const { error } = await client.from("sales").delete().eq("id", saleId);
  if (error) throw error;
}

export async function signInCloudAdmin(email: string, password: string) {
  const client = requireClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutCloudAdmin() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCloudSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
