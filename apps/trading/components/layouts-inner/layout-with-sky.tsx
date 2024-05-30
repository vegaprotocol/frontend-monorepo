import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { Outlet } from 'react-router-dom';
import { TinyScroll } from '@vegaprotocol/ui-toolkit';

export const SKY_BACKGROUND =
  'bg-[url(/sky-light.png)] dark:bg-[url(/sky-dark.png)] bg-[37%_0px] bg-[length:1440px] bg-no-repeat bg-local';

const Layout = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        'max-w-[1440px]',
        'mx-auto px-4 lg:px-32 pb-32',
        'relative z-0',
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
    <TinyScroll className={classNames(SKY_BACKGROUND)}>
      <Layout className={className} {...props} />
    </TinyScroll>
  );
};
