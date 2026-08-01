// Fetch existing content file from GitHub API (or KV)
async function loadBlogPost(slug) {
  const res = await fetch(`https://api.github.com/repos/tngkne/netsorna-wb/contents/content/blog/${slug}.md`);
  const fileData = await res.json();
  
  // Decode Base64 content
  const markdownText = decodeURIComponent(escape(atob(fileData.content)));
  
  document.getElementById("editor").value = markdownText;
  document.getElementById("file-sha").value = fileData.sha; // Save SHA for updates
}

// Save edited content back to GitHub via Worker
async function saveBlogPost(slug) {
  const content = document.getElementById("editor").value;
  const sha = document.getElementById("file-sha").value;

  const res = await fetch("/admin/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: `content/blog/${slug}.md`,
      content: content,
      sha: sha,
      message: `cms: update blog post ${slug}`
    })
  });

  const result = await res.json();
  if (result.success) {
    alert("Saved & Committed to GitHub!");
  } else {
    alert("Error: " + result.error);
  }
}
