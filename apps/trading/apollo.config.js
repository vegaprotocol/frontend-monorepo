module.exports = {
  client: {
    service: {
      name: 'vega',
      url: process.env.NX_VEGA_URL,
    },
    includes: ['{components,lib,pages}/**/*.{ts,tsx,js,jsx,graphql}'],
  },
};
