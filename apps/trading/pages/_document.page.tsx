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
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/preloader.css" media="all" />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://static.vega.xyz/favicon.ico"
        />
        <script src="/theme-setter.js" type="text/javascript" async />
      </Head>
      <body className="bg-white dark:bg-vega-cdark-900 text-default font-alpha">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
