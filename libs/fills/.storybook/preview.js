import './styles.css';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useEffect, useState } from 'react';

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
    // storybook-addon-themes doesnt seem to provide the current selected
    // theme in context, we need to provid it in JS as some components
    // rely on it for rendering
    const [theme, setTheme] = useState(context.parameters.themes.default);

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

      observer.observe(document.body, { attributes: true });

      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <div style={{ width: '100%', height: 500 }}>
        <ThemeContext.Provider value={theme}>
          <Story />
        </ThemeContext.Provider>
      </div>
    );
  },
];
