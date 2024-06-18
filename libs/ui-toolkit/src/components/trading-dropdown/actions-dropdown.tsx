import { VegaIcon, VegaIconNames } from '../icon';
import {
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownTrigger,
} from './trading-dropdown';

export const ActionsDropdownTrigger = ({
  vertical,
}: {
  vertical?: boolean;
}) => {
  return (
    <TradingDropdownTrigger data-testid="dropdown-menu">
      <button type="button">
        <VegaIcon
          name={VegaIconNames.KEBAB}
          size={vertical ? 24 : undefined}
          className={vertical ? 'rotate-90' : undefined}
        />
      </button>
    </TradingDropdownTrigger>
  );
};

type ActionMenuContentProps = React.ComponentProps<
  typeof TradingDropdownContent
> & { vertical?: boolean };

export const ActionsDropdown = ({
  vertical,
  ...props
}: ActionMenuContentProps) => {
  return (
    <TradingDropdown trigger={<ActionsDropdownTrigger vertical={vertical} />}>
      <TradingDropdownContent {...props} side="bottom" align="end" />
    </TradingDropdown>
  );
};
