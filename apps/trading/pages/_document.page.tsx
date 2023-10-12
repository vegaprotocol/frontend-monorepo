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

        {/* preload fonts */}
        <link
          rel="preload"
          href="/AlphaLyrae-Medium.woff2"
          as="font"
          type="font/woff2"
        />

        {/* icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" content="/favicon.ico" />

        {/* scripts */}
        <script src="/theme-setter.js" type="text/javascript" async />
      </Head>
      <Html>
        <body
          // Nextjs will set body to display none until js runs. Because the entire app is client rendered
          // and delivered via ipfs we override this to show a server side render loading animation until the
          // js is downloaded and react takes over rendering
          style={{ display: 'block' }}
          className="bg-white dark:bg-vega-cdark-900 text-default font-alpha"
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    </>
  );
}
