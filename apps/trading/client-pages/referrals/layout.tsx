import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { SKY_BACKGROUND } from './constants';
import { Outlet } from 'react-router-dom';

export const Layout = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        'max-w-[1440px]',
        'mx-auto px-4 md:px-32 lg:px-16 pb-32',
        'relative z-0',
        'h-full overflow-auto',
        className
      )}
      {...props}
    >
      {children || <Outlet />}
    </div>
  );
};

export const LayoutWithSky = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames('h-full', SKY_BACKGROUND)}>
      <Layout className={className} {...props} />
    </div>
  );
};
