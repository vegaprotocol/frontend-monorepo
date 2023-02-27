import { t } from '@vegaprotocol/react-helpers';
import { Link } from 'react-router-dom';
import { Icon } from '@vegaprotocol/ui-toolkit';

export const Header = ({
  name,
  symbol,
}: {
  name?: string;
  symbol?: string;
}) => {
  return (
    <div>
      <div className="mb-6">
        <Link to="/">
          <Icon name="chevron-left" className="mr-2" />
          <span className="underline font-alpha calt text-lg font-medium">
            {t('Liquidity opportunities')}
          </span>
        </Link>
      </div>
      <h1 className="font-alpha calt text-5xl mb-6">{name}</h1>
      <p className="font-alpha calt text-4xl">{symbol}</p>
    </div>
  );
};
