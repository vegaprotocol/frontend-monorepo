import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

export const Backdrop = (props: { backdrop?: number }) => {
  const { theme } = useThemeSwitcher();
  if (props.backdrop !== undefined) {
    const backdrop =
      theme === 'dark'
        ? `backdrop-dark-${props.backdrop}.jpg`
        : `backdrop-light-${props.backdrop}.jpg`;
    return (
      <div
        className="fixed top-0 left-0 w-full h-full -z-10 bg-cover bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(/${backdrop})` }}
      />
    );
  }

  return null;
};
