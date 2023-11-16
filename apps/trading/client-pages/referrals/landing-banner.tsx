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
            {t('Earn commission & stake rewards')}
          </h1>
          <p className="text-lg mb-10">
            {t(
              'Invite friends and earn rewards from the trading fees they pay. Stake those rewards to earn multipliers on future rewards.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
