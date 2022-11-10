import { ClientRouter } from './client-router';

/**
 * Next only handles this single index page, react-router takes over after the page
 * is served to the browser. This is because we can't run next server via ipfs and
 * have to serve a static site via next export
 */
export default function Index() {
  return <ClientRouter />;
}
