import styles from './tiny-scroll.module.scss';
import { forwardRef } from 'react';
import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

export type TinyScrollProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const TinyScroll = forwardRef<HTMLDivElement, TinyScrollProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(className, styles['scroll'])}
      {...props}
    >
      {children}
    </div>
  )
);
