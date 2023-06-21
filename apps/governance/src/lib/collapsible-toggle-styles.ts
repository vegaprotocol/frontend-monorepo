import classnames from 'classnames';

export const collapsibleToggleStyles = (toggleState: boolean) =>
  classnames('mb-4 transition-transform ease-in-out duration-300', {
    'rotate-180': toggleState,
  });
