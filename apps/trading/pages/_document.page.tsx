import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="stylesheet" href="https://static.vega.xyz/fonts.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://static.vega.xyz/favicon.ico"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Vega Protocol - VEGA Console" />
        <meta name="og:type" content="website" />
        <meta name="og:url" content="https://console.vega.xyz/" />
        <meta name="og:title" content="Vega Protocol - Console" />
        <meta name="og:site_name" content="Vega Protocol - Console" />
        <meta name="og:image" content="https://static.vega.xyz/favicon.ico" />

        <meta
          name="twitter:card"
          content="https://static.vega.xyz/favicon.ico"
        />
        <meta name="twitter:title" content="Vega Protocol - Console" />
        <meta name="twitter:description" content="Vega Protocol - Console" />
        <meta
          name="twitter:image"
          content="https://static.vega.xyz/favicon.ico"
        />
        <meta name="twitter:image:alt" content="VEGA logo" />
        <meta name="twitter:site" content="@vegaprotocol" />

        <meta name="description" content="Vega Protocol - Console" />
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
