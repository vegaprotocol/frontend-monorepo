import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://static.vega.xyz/fonts.css" />
        <link
          rel="apple-touch-icon"
          content="https://static.vega.xyz/favicon.ico"
        />
        <link
          rel="preload"
          href="https://static.vega.xyz/AlphaLyrae-Medium.woff2"
          as="font"
          type="font/woff2"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://static.vega.xyz/favicon.ico"
        />
        <script src="/theme-setter.js" type="text/javascript" async />
      </Head>
      <Html>
        <body className="bg-white dark:bg-vega-cdark-900 text-default font-alpha">
          <Main />
          <NextScript />
        </body>
      </Html>
    </>
  );
}
