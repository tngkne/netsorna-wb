// Function handling both /api/cms-auth (redirect to GitHub) and /api/cms-auth/callback
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  // Step 1: Redirect user to GitHub for login
  if (!url.pathname.endsWith('/callback')) {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user`;
    return Response.redirect(authUrl, 302);
  }

  // Step 2: Process GitHub Callback
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  // Exchange code for access token with GitHub
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Netsorna-CMS-Auth'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code
    })
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(`OAuth Error: ${tokenData.error_description}`, { status: 400 });
  }

  // Return script that sends the token back to Decap CMS popup window
  const content = `
    <script>
      (function() {
        function recieveMessage(e) {
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify({
              token: tokenData.access_token,
              provider: 'github'
            })}',
            e.origin
          );
        }
        window.addEventListener("message", recieveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  `;

  return new Response(content, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}
