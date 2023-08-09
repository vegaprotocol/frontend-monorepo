import Head from 'next/head';
import { ClientRouter } from './client-router';

/**
 * Next only handles this single index page, react-router takes over after the page
 * is served to the browser. This is because we can't run next server via ipfs and
 * have to serve a static site via next export
 */
export default function Index() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://static.vega.xyz/favicon.ico"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Vega Protocol - VEGA Console" />
        <link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
        <link rel="manifest" href="assets/manifest.json" />
        <link
          rel="preload"
          href="https://static.vega.xyz/AlphaLyrae-Medium.woff2"
          as="font"
          type="font/woff2"
        />
        <title>VEGA Console dApp</title>
      </Head>
      <ClientRouter />
    </>
  );
}
