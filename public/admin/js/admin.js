// Store a fine-grained PAT in Cloudflare Secrets, expose via a thin worker
// OR (simpler): Use GitHub's OAuth Device Flow for browser-based auth

const GITHUB_API = 'https://api.github.com';
const REPO = 'tngkne/netsorna-wb';
const CONTENT_PATH = 'content/products';

// Read file (GET)
async function getContent(path) {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
    headers: { 'Accept': 'application/vnd.github+json' }
  });
  const data = await res.json();
  return { content: atob(data.content), sha: data.sha };
}

// Write file (PUT) — creates commit
async function updateContent(path, message, content, sha) {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`, // From your CF worker proxy
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({
      message,
      content: btoa(content),
      sha // required for updates
    })
  });
  return res.json();
}
