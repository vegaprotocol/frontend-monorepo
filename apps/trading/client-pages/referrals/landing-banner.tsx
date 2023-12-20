import classNames from 'classnames';
import { AnimatedDudeWithWire } from './graphics/dude';
import { useT } from '../../lib/use-t';

export const LandingBanner = () => {
  const t = useT();
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
            {t('Vega community referrals')}
          </h1>
          <p className="text-lg mb-1">
            {t(
              'Referral programs can be proposed and created via community governance.'
            )}
          </p>
          <p className="text-lg mb-1">
            {t(
              'Once live, users can generate referral codes to share with their friends and earn commission on their trades, while referred traders can access fee discounts based on the running volume of the group.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
