export async function onRequestPost(context) {
  const { request, env } = context;
  const { path, content, sha, message } = await request.json();

  const GITHUB_REPO = "tngkne/netsorna-wb";
  const GITHUB_TOKEN = env.GITHUB_TOKEN; // Set in Cloudflare Secrets

  // 1. Convert content to base64 encoding (GitHub API Requirement)
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  // 2. Commit update directly to GitHub
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Netsorna-CMS"
      },
      body: JSON.stringify({
        message: message || `cms: update ${path}`,
        content: encodedContent,
        sha: sha || undefined // Included if updating an existing file
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return new Response(JSON.stringify({ error: data.message }), { status: 400 });
  }

  // 3. (Optional) Sync to Cloudflare KV immediately for instantaneous fast reads
  if (path.startsWith("content/products/") && env.PRODUCTS_KV) {
    await env.PRODUCTS_KV.put(path.replace("content/products/", "").replace(".json", ""), content);
  }

  return new Response(JSON.stringify({ success: true, commit: data.commit.html_url }), {
    headers: { "Content-Type": "application/json" }
  });
}
