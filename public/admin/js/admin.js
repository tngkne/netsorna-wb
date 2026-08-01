// Function to update a product file in content/products/[slug].json
async function publishProductUpdate(slug, data, existingSha = null) {
  const filePath = `content/products/${slug}.json`;
  const jsonString = JSON.stringify(data, null, 2);

  try {
    const response = await fetch('/admin-api/github-commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: filePath,
        content: jsonString,
        message: `CMS: Update product ${slug}`,
        sha: existingSha
      })
    });

    const res = await response.json();
    if (res.success) {
      alert('Product saved! Cloudflare build triggered for main site.');
    } else {
      alert(`Save failed: ${res.error}`);
    }
  } catch (err) {
    console.error('API Error:', err);
  }
}
