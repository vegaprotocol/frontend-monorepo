import NextErrorComponent from 'next/error';
import type { NextPageContext } from 'next';

interface ErrorPageProps {
  statusCode: number;
  hasGetInitialPropsRun: boolean;
  err: Error;
}
/**
 * This error component is taken from the Sentry's next js setup docs.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
const ErrorPage = ({
  statusCode,
  hasGetInitialPropsRun,
  err,
}: ErrorPageProps) => {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    console.error(err);
    // Flushing is not required in this case as it only happens on the client
  }

  return <NextErrorComponent statusCode={statusCode} />;
};

ErrorPage.getInitialProps = async ({
  res,
  err,
  asPath,
  ...props
}: NextPageContext) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps({
    res,
    err,
    ...props,
  });

  // @ts-ignore Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true;

  // Running on the server, the response object (`res`) is available.
  //
  // Next.js will pass an err on the server if a page's data fetching methods
  // threw or returned a Promise that rejected
  //
  // Running on the client (browser), Next.js will provide an err if:
  //
  //  - a page's `getInitialProps` threw or returned a Promise that rejected
  //  - an exception was thrown somewhere in the React lifecycle (render,
  //    componentDidMount, etc) that was caught by Next.js's React Error
  //    Boundary. Read more about what types of exceptions are caught by Error
  //    Boundaries: https://reactjs.org/docs/error-boundaries.html

  if (err) {
    console.error(err);

    return errorInitialProps;
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  console.error(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`)
  );

  return errorInitialProps;
};

export default ErrorPage;
