import { useVerifiedStatusIcon } from '@vegaprotocol/markets';
import type { Provider } from '@vegaprotocol/markets';
import { Icon, type IconName, Intent } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';

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
          'text-blue': intent === Intent.Primary,
          'text-green dark:text-green': intent === Intent.Success,
          'text-yellow-600 dark:text-yellow': intent === Intent.Warning,
          'text-red': intent === Intent.Danger,
        },
        'flex items-start align-text-bottom'
      )}
    >
      <Icon size={5} name={icon as IconName} />
      <p className="ml-1 text-sm text-surface-1-fg align-text-middle">
        {message}
      </p>
    </div>
  );
};
