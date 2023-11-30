import classNames from 'classnames';
import { AnimatedDudeWithWire } from './graphics/dude';
import { useT } from '../../lib/use-t';

export const LandingBanner = () => {
  const t = useT();
  return (
    <div className={classNames('relative mb-20')}>
      <div className="">
        <div
          aria-hidden
          className="absolute top-20 right-[120px] md:right-[240px] max-sm:hidden"
        >
          <AnimatedDudeWithWire />
        </div>
        <div className="pt-20 sm:w-[50%]">
          <h1 className="text-6xl font-alpha calt mb-10">
            {t('Vega Community Referral Program')}
          </h1>
          <p className="text-lg mb-1">
            {t(
              'Referral programs can be proposed and created via Community governance.'
            )}
          </p>
          <p className="text-lg mb-10">
            {t(
              'Once live, users can generate referral codes to share with their friends and earn commission on their trades, while referred traders can access fee discounts based on the running volume of the group.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
