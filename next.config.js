/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Required so Server Actions (login/signup forms) work when the app
      // runs behind GitHub Codespaces' forwarded-port domain, which differs
      // from the actual request host Next.js expects by default.
	    allowedOrigins: ["localhost:3000", "*.app.github.dev"],
    },
  },
};

module.exports = nextConfig;
