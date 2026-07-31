// Handles /api/cms-auth (Redirects to GitHub) and /api/cms-auth/callback (Exchanges token)
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const client_id = context.env.GITHUB_CLIENT_ID;
  const client_secret = context.env.GITHUB_CLIENT_SECRET;

  // Step 1: Redirect user to GitHub login
  if (!url.pathname.endsWith('/callback')) {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
    return Response.redirect(authUrl, 302);
  }

  // Step 2: Handle GitHub OAuth Callback
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response("Missing OAuth code from GitHub", { status: 400 });
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return new Response(`OAuth Error: ${data.error_description}`, { status: 400 });
    }

    const token = data.access_token;
    
    // Post back token to Decap CMS popup via window message
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          (function() {
            function recieveMessage(e) {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
                e.origin
              );
            }
            window.addEventListener("message", recieveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script>
      </body>
      </html>
    `;

    return new Response(htmlResponse, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    return new Response(`Authentication Server Error: ${err.message}`, { status: 500 });
  }
}
