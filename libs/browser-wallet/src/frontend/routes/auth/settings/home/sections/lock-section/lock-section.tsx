import { Button } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { VegaSection } from '@/components/vega-section';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';

import { FULL_ROUTES } from '../../../../../route-names';

export const locators = {
  settingsLockButton: 'settings-lock-button',
  settingsFeedbackDescription: 'settings-feedback-description',
  settingsFeedbackLink: 'settings-feedback-link',
};

export const LockSection = () => {
  const { request } = useJsonRpcClient();
  const navigate = useNavigate();
  const { handleSubmit: handleLock } = useForm();
  const lock = async () => {
    await request(RpcMethods.Lock, null);
    navigate(FULL_ROUTES.login);
  };
  return (
    <VegaSection>
      <form className="pb-6" onSubmit={handleLock(lock)}>
        <Button
          data-testid={locators.settingsLockButton}
          fill={true}
          variant="secondary"
          type="submit"
        >
          Lock
        </Button>
      </form>
    </VegaSection>
  );
};
