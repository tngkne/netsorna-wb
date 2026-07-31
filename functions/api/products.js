export async function onRequestGet(context) {
  try {
    // Fetch product list from Cloudflare KV
    const productsList = await context.env.STORE_PRODUCTS.list();
    const products = [];

    for (const key of productsList.keys) {
      const productData = await context.env.STORE_PRODUCTS.get(key.name, "json");
      if (productData) products.push(productData);
    }

    return new Response(JSON.stringify(products), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
