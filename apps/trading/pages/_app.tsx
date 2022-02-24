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
      <main className="px-8 py-12">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default VegaTradingApp;
