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
          <span className="underline font-alpha text-lg font-medium">
            {t('Liquidity opportunities')}
          </span>
        </Link>
      </div>
      <h1 className="font-alpha text-5xl mb-8">{name}</h1>
      <p className="font-alpha text-4xl mb-12">{symbol}</p>
    </div>
  );
};
