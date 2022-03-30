import classNames from 'classnames';
import { getIntentShadow, Intent } from '../../utils/intent';
import type { IconName } from '../icon';
import { Icon } from '../icon';

export interface CalloutProps {
  children?: React.ReactNode;
  title?: React.ReactElement | string;
  intent?: Intent;
  iconName?: IconName;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Callout({
  children,
  title,
  intent = Intent.Help,
  iconName,
  headingLevel,
}: CalloutProps) {
  const className = classNames(
    'border',
    'border-black',
    'dark:border-white',
    'text-body-large',
    'dark:text-white',
    'p-8',
    getIntentShadow(intent),
    {
      flex: !!iconName,
    }
  );
  const TitleTag: keyof JSX.IntrinsicElements = headingLevel
    ? `h${headingLevel}`
    : 'div';
  const icon = iconName && (
    <Icon name={iconName} className="fill-current ml-8 mr-16 mt-8" size={20} />
  );
  const body = (
    <>
      {title && <TitleTag className="text-h5">{title}</TitleTag>}
      {children}
    </>
  );
  return (
    <div data-testid="callout" className={className}>
      {icon}
      {icon ? <div className="grow">{body}</div> : body}
    </div>
  );
}
