import './styles.scss';
import { useEffect } from 'react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: { disable: true },
  themes: {
    default: 'dark',
    list: [
      { name: 'dark', class: ['dark', 'bg-black'], color: '#000' },
      { name: 'light', class: '', color: '#FFF' },
    ],
  },
};

export const decorators = [
  (Story, context) => {
    // storybook-addon-themes doesn't seem to provide the current selected
    // theme in context, we need to provide it in JS as some components
    // rely on it for rendering
    const { setTheme } = useThemeSwitcher();

    useEffect(() => {
      const observer = new MutationObserver((mutationList) => {
        if (mutationList.length) {
          const body = mutationList[0].target;
          if (body.classList.contains('dark')) {
            setTheme('dark');
          } else {
            setTheme('light');
          }
        }
      });

      observer.observe(document.documentElement, { attributes: true });

      return () => {
        observer.disconnect();
      };
    }, [setTheme]);

    return (
      <div style={{ width: '100%', height: 500 }}>
        <Story />
      </div>
    );
  },
];
