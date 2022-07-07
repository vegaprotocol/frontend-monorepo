import '../src/styles.scss';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: { disable: true },
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
  /*themes: {
    default: 'dark',
    list: [
      { name: 'dark', class: ['dark', 'bg-black'], color: '#000' },
      { name: 'light', class: '', color: '#FFF' },
    ],
  },*/
};

export const decorators = [
  (Story, context) =>
    context.parameters.themes === false ? (
      <div className="text-body">
        <Story />
      </div>
    ) : (
      <div className="text-body">
        <StoryWrapper className="dark bg-black">
          <Story />
        </StoryWrapper>
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      </div>
    ),
];

const StoryWrapper = ({ children, className }) => (
  <div className={className}>
    <div className="p-16">
      <div className="dark:bg-black dark:text-white-60 bg-white text-black-60">
        {children}
      </div>
    </div>
  </div>
);
