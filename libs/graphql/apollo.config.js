module.exports = {
  client: {
    service: {
      name: 'vega',
      url: process.env.NX_VEGA_URL,
    },
    includes: ['../../{apps,lib}/**/*.{ts,tsx,js,jsx,graphql}'],
  },
};
