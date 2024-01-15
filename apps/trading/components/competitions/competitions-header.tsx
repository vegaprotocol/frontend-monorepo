import classNames from 'classnames';
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
    <div className={classNames('relative mb-10 lg:mb-20')}>
      <div className="">
        <div
          aria-hidden
          className="absolute top-20 right-[220px] md:right-[240px] max-sm:hidden"
        >
          <AnimatedDudeWithWire />
        </div>
        <div className="pt-10 lg:pt-20 sm:w-[50%]">
          <h1 className="text-3xl _text-[6vw] lg:!text-6xl leading-[1em] font-alpha calt mb-10">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
};
