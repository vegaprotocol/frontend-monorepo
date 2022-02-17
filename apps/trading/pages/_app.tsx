import { AppProps } from 'next/app';
import Head from 'next/head';
import { Navbar } from '../components/navbar';
import './styles.css';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to trading!</title>
      </Head>
      <Navbar />
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default VegaTradingApp;
