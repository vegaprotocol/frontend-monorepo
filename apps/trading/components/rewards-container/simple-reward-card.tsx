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
import { Links } from 'apps/trading/lib/links';
import { type RewardCard } from '@vegaprotocol/rest';

export const SimpleRewardCard = ({
  rewardId,
  title,
  description,
  tags,
}: RewardCard) => {
  const t = useT();
  return (
    <div className="grid grid-rows-[subgrid] row-span-4 px-4 pt-28 pb-4 rounded-grid relative overflow-hidden">
      <ColourfulBorder />
      <RewardImage />
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-start gap-2">
          {tags.map((t, i) => (
            <Pill key={`pill-${i}-${t}`} size="sm">
              {t}
            </Pill>
          ))}
        </div>
      )}

      <h3 className="text-2xl leading-none">{title}</h3>
      <div className="flex flex-col gap-4">
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
      </div>

      <Link to={Links.COMPETITIONS_GAME(rewardId)}>
        <Button className="w-full" intent={Intent.Primary}>
          {t('View more')}
        </Button>
      </Link>
    </div>
  );
};

const RewardImage = () => (
  // PLACEHOLDER TODO: Change this to an image
  <div className="absolute top-px left-px right-px h-24 bg-surface-1 overflow-hidden rounded-t-grid">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <VegaIcon name={VegaIconNames.DICE} size={24} className="animate-pulse" />
    </div>
  </div>
);
