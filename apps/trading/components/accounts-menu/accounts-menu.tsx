import { useNavigate } from 'react-router-dom';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';

export const AccountsMenu = () => {
  const t = useT();
  const navigate = useNavigate();

  return (
    <>
      <TradingButton
        size="extra-small"
        data-testid="open-transfer"
        role="link"
        onClick={() => navigate(Links.TRANSFER())}
      >
        {t('Transfer')}
      </TradingButton>
      <TradingButton
        size="extra-small"
        role="link"
        onClick={() => navigate(Links.DEPOSIT())}
      >
        {t('Deposit')}
      </TradingButton>
    </>
  );
};
