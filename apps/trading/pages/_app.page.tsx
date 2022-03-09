import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useMemo } from 'react';
import { Navbar } from '../components/navbar';
import { createClient } from '../lib/apollo-client';
import './styles.css';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  const client = useMemo(() => createClient(process.env['NX_VEGA_URL']), []);
  return (
    <ApolloProvider client={client}>
      <Head>
        <title>Welcome to trading!</title>
      </Head>
      <div className="h-full grid grid-rows-[min-content,_1fr] dark:bg-black dark:text-white-60 bg-white text-black-60">
        <Navbar />
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </ApolloProvider>
  );
}

export default VegaTradingApp;
