import '../src/styles.css';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const decorators = [
  (Story, context) =>
    context.parameters.themes === false ? (
      <div className="text-body">
        <Story />
      </div>
    ) : (
      <>
        <div className="dark bg-black text-white-60 p-16">
          <Story />
        </div>
        <div className="bg-white text-black-60 p-16">
          <Story />
        </div>
      </>
    ),
];
