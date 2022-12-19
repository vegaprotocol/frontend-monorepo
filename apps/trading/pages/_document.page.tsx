import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="stylesheet" href="https://static.vega.xyz/fonts.css" />
        <link
          rel="preload"
          href="https://static.vega.xyz/AlphaLyrae-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://static.vega.xyz/favicon.ico"
        />
        {['1', 'true'].includes(process.env['NX_USE_ENV_OVERRIDES'] || '') ? (
          /* eslint-disable-next-line @next/next/no-sync-scripts */
          <script src="/assets/env-config.js" type="text/javascript" />
        ) : null}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
