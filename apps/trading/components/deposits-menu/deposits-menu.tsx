import { useNavigate } from 'react-router-dom';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';

export const DepositsMenu = () => {
  const t = useT();
  const navigate = useNavigate();

  return (
    <TradingButton
      size="extra-small"
      role="link"
      onClick={() => navigate(Links.DEPOSIT())}
      data-testid="deposit-button"
    >
      {t('Deposit')}
    </TradingButton>
  );
};
