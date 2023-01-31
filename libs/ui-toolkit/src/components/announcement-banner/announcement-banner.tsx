import classnames from 'classnames';
import type { ReactNode } from 'react';

export interface BannerProps {
  children?: ReactNode;
}

export const AnnouncementBanner = ({ children }: BannerProps) => {
  const bannerClasses = classnames(
    "bg-[url('https://static.vega.xyz/assets/img/banner-bg.jpg')] bg-cover bg-center bg-no-repeat",
    'p-4'
  );

  return <div className={bannerClasses}>{children}</div>;
};
