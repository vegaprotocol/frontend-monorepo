import '../src/styles.scss';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  themes: {
    default: 'dark',
    list: [
      { name: 'dark', class: ['dark', 'bg-black'], color: '#000' },
      { name: 'light', class: '', color: '#FFF' },
    ],
  },
};

export const decorators = [
  (Story) => (
    <div className="dark bg-black">
      <Story />
    </div>
  ),
];
