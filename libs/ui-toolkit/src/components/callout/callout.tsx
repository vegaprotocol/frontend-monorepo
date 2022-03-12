import classNames from 'classnames';
import { Intent, getIntentShadow } from '../../utils/intent';
import { Icon, IconName } from '../icon';

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
  intent = 'help',
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
    { flex: !!iconName },
    getIntentShadow(intent)
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
