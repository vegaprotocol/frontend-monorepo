import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';

export interface BannerProps {
  children?: ReactNode;
  className?: string;
  background?: string;
}

export const AnnouncementBanner = ({
  className,
  children,
  background = 'url("https://static.vega.xyz/assets/img/banner-bg.jpg")',
}: BannerProps) => {
  const bannerClasses = cn('p-4', className);

  return (
    <div
      className={bannerClasses}
      style={{
        background,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {children}
    </div>
  );
};
