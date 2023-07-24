import { t } from '@vegaprotocol/i18n';
import { Side } from '@vegaprotocol/types';
import classNames from 'classnames';

interface Props {
  side: Side;
}

export const DealTicketButton = ({ side }: Props) => {
  const buttonClasses = classNames(
    'px-10 py-2 uppercase rounded-md text-white w-full',
    {
      'bg-market-red': side === Side.SIDE_SELL,
      'bg-market-green-550': side === Side.SIDE_BUY,
    }
  );
  return (
    <div className="mb-2">
      <button type="submit" data-testid="place-order" className={buttonClasses}>
        {t('Place order')}
      </button>
    </div>
  );
};
