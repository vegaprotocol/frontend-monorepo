import { Button } from '@vegaprotocol/ui-toolkit';
import { useNavigate } from 'react-router-dom';

import config from '!/config';
import { ExternalLink } from '@/components/external-link';
import { Frame } from '@/components/frame';
import { Tick } from '@/components/icons/tick';
import { StarsWrapper } from '@/components/stars-wrapper';
import { VegaHeader } from '@/components/vega-header';

import { FULL_ROUTES } from '../../route-names';
import { Disclaimer } from './disclaimer';

export const locators = {
  getStartedButton: 'get-started-button',
};

const ITEMS = [
  'Securely connect to Vega dapps',
  'Instantly approve and reject transactions',
];

export const GetStarted = () => {
  const navigate = useNavigate();
  return (
    <StarsWrapper>
      <VegaHeader />
      <Frame>
        <ul className="list-none text-left">
          {ITEMS.map((index) => (
            <li key={index} className="flex">
              <div>
                <Tick size={12} className="mr-2 text-vega-green-550" />
              </div>
              <p className="text-white">{index}</p>
            </li>
          ))}
        </ul>
      </Frame>
      <Disclaimer />
      <Button
        className="mt-4"
        autoFocus
        onClick={() => {
          navigate(FULL_ROUTES.createPassword);
        }}
        type="submit"
        data-testid={locators.getStartedButton}
        variant="primary"
        fill={true}
      >
        I understand
      </Button>
      <ExternalLink
        className="text-xs text-white mt-4"
        href={config.userDataPolicy}
      >
        User data policy
      </ExternalLink>
    </StarsWrapper>
  );
};
