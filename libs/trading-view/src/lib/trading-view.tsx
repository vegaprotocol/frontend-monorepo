import styles from './trading-view.module.scss';

/* eslint-disable-next-line */
export interface TradingViewProps {}

export function TradingView(props: TradingViewProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to TradingView!</h1>
    </div>
  );
}

export default TradingView;
