import styles from './index.module.scss';
import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
import { ReactHelpers } from '@vegaprotocol/react-helpers';
import { useRouter } from 'next/router';
import Link from 'next/link';

export function Index() {
  const router = useRouter();
  console.log(router);
  return (
    <div className={styles.page}>
      <h1>Vega Trading</h1>
      <nav>
        {[
          { name: 'Portfolio', path: '/portfolio' },
          { name: 'Markets', path: '/markets' },
        ].map((route) => (
          <Link href={route.path} key={route.path}>
            {route.name}
          </Link>
        ))}
      </nav>
      <h2>Test packages</h2>
      <ReactHelpers />
      <EtherscanLink
        text={`Link to TX: 0x6f534dfbd01cb8a9e15493863f4c0ec13bef47ea84152da0674ab0b57f3b4c9c`}
        chainId="0x1"
        tx="0x6f534dfbd01cb8a9e15493863f4c0ec13bef47ea84152da0674ab0b57f3b4c9c"
      />
    </div>
  );
}

export default Index;
