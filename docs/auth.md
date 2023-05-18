# Setting up authentication

## Auth0

Create a new application in Auth0, choosing Regular Web Application. Click on the Quick Start tab and choose NextJS as the technology. Most of this can be ignored, since we're using next-auth. However, we need the AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET and AUTH0_ISSUER_BASE_URL. Copy those values into your .env file.

Finally, go to the Settings tab and add `http://localhost:3000/api/auth/callback/auth0` to the Allowed Callback URLs.

TODO: document solutions to
[next-auth][warn][NEXTAUTH_URL]
https://next-auth.js.org/warnings#nextauth_url
[next-auth][warn][NO_SECRET]
https://next-auth.js.org/warnings#no_secret
