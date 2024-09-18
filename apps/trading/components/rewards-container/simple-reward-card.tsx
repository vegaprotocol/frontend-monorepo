import { Button, cn, Intent } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { GradientText } from '../gradient-text';
import { ColourfulBorder } from '@vegaprotocol/ui-toolkit';
import { Links } from 'apps/trading/lib/links';
import { type RewardCard } from '@vegaprotocol/rest';

export const SimpleRewardCard = ({
  rewardId,
  title,
  img,
  description,
  tags,
}: RewardCard) => {
  const t = useT();
  return (
    <div className="grid grid-rows-[subgrid] row-span-5 p-4 rounded-grid relative overflow-hidden">
      <ColourfulBorder />
      <RewardImage img={img} />

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-start gap-2">
          {tags.map((t, i) => (
            <span
              key={i}
              className={cn('text-sm py-1 px-2 rounded-full text-white', {
                'bg-highlight': t.variant === 'primary',
                'bg-highlight-secondary': t.variant === 'secondary',
                'bg-highlight-tertiary': t.variant === 'tertiary',
              })}
            >
              {t.text}
            </span>
          ))}
        </div>
      )}

      <h3 className="text-3xl leading-none">{title}</h3>

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
              return (
                <GradientText>
                  <strong>{children}</strong>
                </GradientText>
              );
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

const RewardImage = (props: { img: string }) => (
  <div className="aspect-[389/160] bg-surface-1 overflow-hidden rounded-grid -mx-4 -mt-4">
    {/* eslint-disable-next-line */}
    <img
      src={props.img ? props.img : '/game-default.png'}
      className="object-cover"
    />
  </div>
);
