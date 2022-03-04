import '../src/styles.scss';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
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
        <div className="dark bg-black p-16">
          <Story />
        </div>
        <div className="p-16">
          <Story />
        </div>
      </div>
    ),
];
