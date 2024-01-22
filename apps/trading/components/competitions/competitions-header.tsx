import { AnimatedDudeWithWire } from '../../client-pages/referrals/graphics/dude';
import { type ReactNode } from 'react';

export const CompetitionsHeader = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => {
  return (
    <div className="relative mb-4 lg:mb-20">
      <div
        aria-hidden
        className="absolute top-20 right-[220px] md:right-[240px] max-sm:hidden"
      >
        <AnimatedDudeWithWire />
      </div>
      <div className="pt-6 lg:pt-20 sm:w-1/2">
        <h1 className="text-3xl lg:text-6xl leading-[1em] font-alpha calt mb-2 lg:mb-10">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};
