import { useState } from 'react';
import styles from './foo.module.css';

/* eslint-disable-next-line */
export interface FooProps {}

export function Foo(props: FooProps) {
  console.log('FOO 1');
  const [count, setCount] = useState(0);
  return (
    <div className={styles['container']}>
      <h1>Welcome to Foo!</h1>
      <button onClick={() => setCount((x) => x + 1)}>{count}</button>
    </div>
  );
}

export default Foo;
