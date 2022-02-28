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
      <Navbar />
      <main className="px-8 py-12">
        <Component {...pageProps} />
      </main>
    </ApolloProvider>
  );
}

export default VegaTradingApp;
