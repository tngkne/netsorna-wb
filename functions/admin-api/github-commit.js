export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { path, content, message, sha } = await request.json();

    if (!path || !content) {
      return new Response(JSON.stringify({ error: 'Path and content are required.' }), { status: 400 });
    }

    const repoOwner = "tngkne";
    const repoName = "netsorna-wb";
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;

    // Base64 encode Unicode content cleanly
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    const payload = {
      message: message || `CMS Update: ${path}`,
      content: encodedContent,
      branch: "main"
    };

    if (sha) payload.sha = sha;

    const ghResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'User-Agent': 'Cloudflare-Worker-CMS',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await ghResponse.json();

    if (!ghResponse.ok) {
      return new Response(JSON.stringify({ error: result.message }), { status: ghResponse.status });
    }

    return new Response(JSON.stringify({ success: true, sha: result.content.sha }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
