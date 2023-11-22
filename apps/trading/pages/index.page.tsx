import Head from 'next/head';
import { ClientRouter } from './client-router';
import Script from 'next/script';
import { useState } from 'react';

/**
 * Next only handles this single index page, react-router takes over after the page
 * is served to the browser. This is because we can't run next server via ipfs and
 * have to serve a static site via next export
 */
export default function Index() {
  const [isScriptReady, setIsScriptReady] = useState(false);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Vega Protocol - Console" />
        <meta name="og:type" content="website" />
        <meta name="og:url" content="https://console.vega.xyz/" />
        <meta name="og:title" content="Vega Protocol - Console" />
        <meta name="og:site_name" content="Vega Protocol - Console" />
        <meta name="og:image" content="./favicon.ico" />
        <meta name="twitter:card" content="./favicon.ico" />
        <meta name="twitter:title" content="Vega Protocol - Console" />
        <meta name="twitter:description" content="Vega Protocol - Console" />
        <meta name="twitter:image" content="./favicon.ico" />
        <meta name="twitter:image:alt" content="VEGA logo" />
        <meta name="twitter:site" content="@vegaprotocol" />
      </Head>
      <Script
        src="/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />
      {isScriptReady && <ClientRouter />}
    </>
  );
}
