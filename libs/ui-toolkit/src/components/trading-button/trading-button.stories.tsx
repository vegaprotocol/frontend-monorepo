import type { Meta } from '@storybook/react';
import { TradingButton } from './trading-button';
import { Intent } from '../../utils/intent';
import { Icon } from '../icon';

const Story: Meta<typeof TradingButton> = {
  component: TradingButton,
  title: 'TradingButton',
};
export default Story;

export const Small = {
  args: {
    children: 'Place order',
    size: 'small',
  },
};

export const Medium = {
  args: {
    children: 'Place order',
  },
};

export const Large = {
  args: {
    children: 'Place order',
    size: 'large',
  },
};

export const Primary = {
  args: {
    children: 'Place order',
    intent: Intent.Primary,
  },
};

export const Success = {
  args: {
    children: 'Place order',
    intent: Intent.Success,
  },
};

export const Warning = {
  args: {
    children: 'Place order',
    intent: Intent.Warning,
  },
};

export const Danger = {
  args: {
    children: 'Place order',
    intent: Intent.Danger,
  },
};

export const Info = {
  args: {
    children: 'Place order',
    intent: Intent.Info,
  },
};

export const WithIcon = {
  args: {
    children: 'Place order',
    icon: <Icon name="edit" className="ml-2" />,
  },
};

export const MultiLine = {
  args: {
    intend: Intent.Success,
    children: 'Place order',
    subLabel: (
      <>
        50 ETH
        <br />
        Total 75,800 USDT
      </>
    ),
  },
};
