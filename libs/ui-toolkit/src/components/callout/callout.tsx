import styles from './callout.module.scss';
import React from 'react';

export const Callout = ({
  children,
  title,
  intent,
  icon,
}: {
  children?: React.ReactNode;
  title?: React.ReactElement | string;
  intent?: 'success' | 'error' | 'warn' | 'action';
  icon?: React.ReactNode;
}) => {
  const className = [
    styles['callout'],
    intent ? styles[`callout--${intent}`] : '',
  ].join(' ');
  return (
    <div data-testid="callout" className={className}>
      {icon && <div className={styles['callout__icon']}>{icon}</div>}
      <div className={styles['callout__content']}>
        {title && <h3 className={styles['callout__title']}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};
