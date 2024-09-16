import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { cn } from '@vegaprotocol/ui-toolkit';

export const Logo = (props: { className?: string }) => {
  const { theme } = useThemeSwitcher();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="Logo"
      src={theme === 'dark' ? './logo-dark.svg' : './logo-light.svg'}
      className={cn('block w-24', props.className)}
    />
  );
};
