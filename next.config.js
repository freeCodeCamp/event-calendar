// Eval is used in development, so we have to allow it.
const CSP = `default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; connect-src 'self' https://ipwho.is; ${
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'" // TODO: Is there a safer way to do this? Nonce?
}`;

// TODO: add the rest.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: CSP,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["validator"],
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
