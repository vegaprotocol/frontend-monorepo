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

// export const decorators = [
//   (Story, context) =>
//     context.parameters.themes === false ? (
//       <div className="text-body">
//         <Story />
//       </div>
//     ) : (
//       <div className="text-body">
//         <StoryWrapper className="dark bg-black">
//           <Story />
//         </StoryWrapper>
//         <StoryWrapper>
//           <Story />
//         </StoryWrapper>
//       </div>
//     ),
// ];

// const StoryWrapper = ({ children, className }) => (
//   <div className={className}>
//     <div className="p-16">
//       <div className="dark:bg-black dark:text-white-60 bg-white text-black-60">
//         {children}
//       </div>
//     </div>
//   </div>
// );
