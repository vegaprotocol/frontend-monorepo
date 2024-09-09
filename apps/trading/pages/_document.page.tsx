import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <>
      <Head>
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Html className="dark">
        <body
          // Next.js will set body to display none until js runs. Because the entire app is client rendered
          // and delivered via IPFS we override this to show a server side render loading animation until the
          // js is downloaded and react takes over rendering
          style={{ display: 'block' }}
          className="bg-surface-0 text-surface-0-fg font-sans"
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    </>
  );
}
