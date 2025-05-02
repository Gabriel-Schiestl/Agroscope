/** @type {import('next').NextConfig} */
const nextConfig = {
  // headers: async () => {
  //   return [
  //     {
  //       source: "/:path*",
  //       headers: [
  //         {
  //           key: "X-Frame-Options",
  //           value: "DENY",
  //         },
  //         {
  //           key: "X-Content-Type-Options",
  //           value: "nosniff",
  //         },
  //         {
  //           key: "Strict-Transport-Security",
  //           value: "max-age=31536000; includeSubDomains; preload",
  //         },
  //         {
  //           key: "Content-Security-Policy",
  //           value:
  //             "default-src 'self'; img-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' http://backend:3001 http://localhost:3000;",
  //         },
  //         {
  //           key: "Referrer-Policy",
  //           value: "no-referrer",
  //         },
  //         {
  //           key: "Cross-Origin-Embedder-Policy",
  //           value: "require-corp",
  //         },
  //         {
  //           key: "Cross-Origin-Resource-Policy",
  //           value: "same-origin",
  //         },
  //         {
  //           key: "Cross-Origin-Opener-Policy",
  //           value: "same-origin",
  //         },
  //       ],
  //     },
  //   ];
  // },

  // Configure webpack to handle browser-only modules
  webpack: (config, { isServer }) => {
    // Replace the previous externals config with this approach
    if (isServer) {
      // Use path joining instead of require.resolve for ESM compatibility
      const path = new URL("../src/mocks/leaflet-mock.js", import.meta.url)
        .pathname;
      const reactLeafletPath = new URL(
        "../src/mocks/react-leaflet-mock.js",
        import.meta.url
      ).pathname;

      // During server-side rendering, mock the leaflet module
      config.resolve.alias.leaflet = path;
      config.resolve.alias["react-leaflet"] = reactLeafletPath;
    }

    return config;
  },
};

export default nextConfig;
