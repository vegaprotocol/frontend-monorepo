import {
  Button,
  Intent,
  Pill,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { GradientText } from '../gradient-text';
import { ColourfulBorder } from 'libs/ui-toolkit/src/utils/border';

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
    <div className="rounded relative p-px">
      <ColourfulBorder className="!rounded" />
      <RewardImage />
      <div className="p-4 flex flex-col gap-4">
        {tags && tags.length > 0 && (
          <div className="flex gap-2">
            {tags?.map((t, i) => (
              <Pill key={`pill-${i}-${t}`} size="sm">
                {t}
              </Pill>
            ))}
          </div>
        )}

        <h3 className="text-2xl leading-none">{title}</h3>

        <ReactMarkdown
          components={{
            p: ({ children }) => {
              return <p>{children}</p>;
            },
            ul: ({ children }) => {
              return (
                <ul className="flex flex-col gap-0 list-disc list-inside marker:text-intent-primary marker:mr-0">
                  {children}
                </ul>
              );
            },
            li: ({ children }) => {
              return (
                <li className="m-0 p-0">
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

        {link && (
          <Link to={link}>
            <Button className="w-full" intent={Intent.Primary}>
              {t('View more')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

const RewardImage = () => (
  // PLACEHOLDER TODO: Change this to an image
  <div className="bg-surface-1 relative h-24 rounded overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <VegaIcon name={VegaIconNames.DICE} size={24} className="animate-pulse" />
    </div>
  </div>
);
