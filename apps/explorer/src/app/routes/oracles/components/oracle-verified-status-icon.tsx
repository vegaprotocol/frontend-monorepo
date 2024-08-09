import { useVerifiedStatusIcon } from '@vegaprotocol/markets';
import type { Provider } from '@vegaprotocol/markets';
import { Icon, type IconName, Intent } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/utils';

export type OracleVerifiedStatusIconProps = {
  provider: Provider;
};

/**
 * Modified, but close to the OracleBasicOProfile in the markets lib. This is
 * required to better fit with the Explorer layout
 *
 * @param provider Oracle proof
 * @returns
 */
export const OracleVerifiedStatusIcon = ({
  provider,
}: OracleVerifiedStatusIconProps) => {
  const { icon, message, intent } = useVerifiedStatusIcon(provider);
  return (
    <div
      className={cn(
        {
          'text-gs-700': intent === Intent.None,
          'text-vega-blue': intent === Intent.Primary,
          'text-vega-green dark:text-vega-green': intent === Intent.Success,
          'text-yellow-600 dark:text-yellow': intent === Intent.Warning,
          'text-vega-red': intent === Intent.Danger,
        },
        'flex items-start align-text-bottom'
      )}
    >
      <Icon size={5} name={icon as IconName} />
      <p className="ml-1 text-sm text-gs-100 align-text-middle">{message}</p>
    </div>
  );
};
