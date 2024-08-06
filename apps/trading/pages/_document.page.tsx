import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <>
      <Head>
        {/* preload fonts */}
        <link
          rel="preload"
          href="/AlphaLyrae.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        {/* scripts */}
        <script src="/theme-setter.js" type="text/javascript" async />

        {/* manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Html>
        <body
          // Next.js will set body to display none until js runs. Because the entire app is client rendered
          // and delivered via IPFS we override this to show a server side render loading animation until the
          // js is downloaded and react takes over rendering
          style={{ display: 'block' }}
          className="bg-white dark:bg-black text-default font-alpha"
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    </>
  );
}
