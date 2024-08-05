import styles from './browser-wallet.module.scss';

/* eslint-disable-next-line */
export interface BrowserWalletProps {}

export function BrowserWallet(props: BrowserWalletProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to BrowserWallet!</h1>
    </div>
  );
}

export default BrowserWallet;
