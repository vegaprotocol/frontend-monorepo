import { AppProps } from 'next/app';
import Head from 'next/head';
import './styles.css';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to trading!</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default VegaTradingApp;
