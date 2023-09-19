import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <>
      <Head>
        {/*
          meta tags
          - next advised against using _document for this, so they exist in our
          - single page index.page.tsx
        */}

        {/* icons */}
        <link rel="icon" type="image/x-icon" href="./favicon.ico" />
        <link rel="apple-touch-icon" content="./favicon.ico" />

        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/preloader.css" media="all" />

        {/* scripts */}
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
