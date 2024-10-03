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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Nebula - Trading" />
        <meta name="og:type" content="website" />
        <meta name="og:url" content="https://trade.neb.exchange" />
        <meta name="og:title" content="Nebula - Trading" />
        <meta name="og:site_name" content="Nebula - Trading" />
        <meta name="og:image" content="./favicon.ico" />
        <meta name="twitter:card" content="./favicon.ico" />
        <meta name="twitter:title" content="Nebula - Trading" />
        <meta name="twitter:description" content="Nebula - Trading" />
        <meta name="twitter:image" content="./favicon.ico" />
        <meta name="twitter:image:alt" content="Nebula logo" />
      </Head>
      <ClientRouter />
    </>
  );
}
