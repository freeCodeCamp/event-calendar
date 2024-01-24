// Eval is used in development, so we have to allow it.
const CSP = `default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; connect-src 'self' https://ipwho.is; ${
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-eval'"
    : ""
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
  output: "standalone",
};

module.exports = nextConfig;
