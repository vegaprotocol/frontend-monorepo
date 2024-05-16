import { useNavigate } from 'react-router-dom';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';

export const WithdrawalsMenu = () => {
  const t = useT();
  const navigate = useNavigate();
  return (
    <TradingButton
      size="extra-small"
      onClick={() => navigate(Links.WITHDRAW())}
      data-testid="withdraw-dialog-button"
    >
      {t('Make withdrawal')}
    </TradingButton>
  );
};
