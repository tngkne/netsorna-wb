export async function onRequest(context) {
  const url = new URL(context.request.url);
  const client_id = context.env.GITHUB_CLIENT_ID;
  const client_secret = context.env.GITHUB_CLIENT_SECRET;

  if (!url.pathname.endsWith('/callback')) {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
    return Response.redirect(authUrl, 302);
  }

  const code = url.searchParams.get('code');
  if (!code) {
    return new Response("Missing OAuth code", { status: 400 });
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ client_id, client_secret, code }),
    });

    const data = await response.json();
    if (data.error) {
      return new Response(`OAuth Error: ${data.error_description}`, { status: 400 });
    }

    const token = data.access_token;
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          (function() {
            function receiveMessage(e) {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
                e.origin
              );
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script>
      </body>
      </html>
    `;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
