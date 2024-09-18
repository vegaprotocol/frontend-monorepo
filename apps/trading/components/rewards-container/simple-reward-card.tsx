import { Button, Intent, Pill } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { GradientText } from '../gradient-text';

type SimpleRewardCardProps = {
  title: string;
  description: string;
  tags?: string[];
  link?: string;
};
export const SimpleRewardCard = ({
  title,
  description,
  tags,
  link,
}: SimpleRewardCardProps) => {
  const t = useT();
  return (
    <div>
      <div>IMG PLACEHOLDER</div>
      <h3>{title}</h3>
      <ReactMarkdown
        components={{
          ul: ({ children }) => {
            return (
              <ul className="list-['⚫️'] list-inside marker:text-intent-primary marker:mr-0">
                {children}
              </ul>
            );
          },
          li: ({ children }) => {
            return (
              <li>
                <span className="relative -left-2">{children}</span>
              </li>
            );
          },
          strong: ({ children }) => {
            return <GradientText>{children}</GradientText>;
          },
        }}
      >
        {description}
      </ReactMarkdown>
      {tags && tags.length > 0 && (
        <div>
          {tags?.map((t, i) => (
            <Pill key={`pill-${i}-${t}`} size="sm">
              {t}
            </Pill>
          ))}
        </div>
      )}
      {link && (
        <Link to={link}>
          <Button intent={Intent.Primary}>{t('View more')}</Button>
        </Link>
      )}
    </div>
  );
};
