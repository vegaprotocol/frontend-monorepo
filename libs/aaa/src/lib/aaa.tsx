import { useState } from 'react';
import styles from './aaa.module.css';

/* eslint-disable-next-line */
export interface AaaProps {}

export function Aaa(props: AaaProps) {
  const [count, setCount] = useState(0);
  return (
    <div className={styles['container']}>
      <h1>Welcome to Aaa!</h1>
      <button onClick={() => setCount((x) => x + 1)}>{count}</button>
    </div>
  );
}

export default Aaa;
