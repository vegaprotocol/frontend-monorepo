import classnames from 'classnames';
import background from './banner-bg.jpg';
import type { ReactNode } from 'react';

export interface BannerProps {
  children?: ReactNode;
}

export const AnnouncementBanner = ({ children }: BannerProps) => {
  const bannerClasses = classnames('bg-cover bg-center bg-no-repeat', 'p-4');

  return (
    <div
      style={{ backgroundImage: `url(${background})` }}
      className={bannerClasses}
    >
      {children}
    </div>
  );
};
