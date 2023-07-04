import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import classNames from 'classnames';
import { useEffect } from 'react';
import '../src/styles.scss';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: { disable: true },
  layout: 'fullscreen',
  a11y: {
    config: {
      rules: [
        {
          // Disabled only for storybook because we display both the dark and light variants of the components on the same page without differentiating the ids, so it will always error.
          id: 'duplicate-id-aria',
          selector: '[data-testid="form-group"] > label',
        },
        {
          // Disabled because we can't control the radix radio group component and it claims to be accessible to begin with, so hopefully no issues.
          id: 'button-name',
          selector: '[role=radiogroup] > button',
        },
      ],
    },
  },
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'dark',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
        { value: 'sideBySide', title: 'Side by side' },
      ],
      showName: true,
    },
  },
};

const StoryWrapper = ({ children, fill }) => {
  const classes = classNames(
    'p-4',
    'bg-white dark:bg-black',
    'text-neutral-800 dark:text-neutral-200',
    {
      'w-screen h-screen': fill,
    }
  );
  return <div className={classes}>{children}</div>;
};

const ThemeWrapper = (Story, context) => {
  const theme = context.parameters.theme || context.globals.theme;
  const { setTheme } = useThemeSwitcher();

  useEffect(() => {
    // in side by side mode a 'dark' class on the html tag will interfere
    // making the light 'side' dark, so remove it in that case
    if (theme === 'sideBySide') {
      document.documentElement.classList.remove('dark');
    } else {
      setTheme(theme);
    }
  }, [setTheme, theme]);

  return theme === 'sideBySide' ? (
    <>
      <div className="bg-white text-black">
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      </div>
      <div className="dark bg-black text-white">
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      </div>
    </>
  ) : (
    <StoryWrapper fill={true}>
      <Story />
    </StoryWrapper>
  );
};

export const decorators = [ThemeWrapper];
