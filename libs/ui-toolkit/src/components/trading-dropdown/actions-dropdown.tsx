import { VegaIcon, VegaIconNames } from '../icon';
import {
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownTrigger,
} from './trading-dropdown';

export const ActionsDropdownTrigger = () => {
  return (
    <TradingDropdownTrigger
      className='hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 [&[aria-expanded="true"]]:bg-vega-light-200 dark:[&[aria-expanded="true"]]:bg-vega-dark-200 p-0.5 rounded-full'
      data-testid="dropdown-menu"
    >
      <button type="button">
        <VegaIcon name={VegaIconNames.KEBAB} />
      </button>
    </TradingDropdownTrigger>
  );
};

type ActionMenuContentProps = React.ComponentProps<
  typeof TradingDropdownContent
>;

export const ActionsDropdown = (props: ActionMenuContentProps) => {
  return (
    <TradingDropdown trigger={<ActionsDropdownTrigger />}>
      <TradingDropdownContent {...props} side="bottom" align="end" />
    </TradingDropdown>
  );
};
