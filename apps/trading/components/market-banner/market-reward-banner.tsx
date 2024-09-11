import {
  type DispatchMetric,
  DispatchMetricDescription,
  DispatchMetricLabels,
} from '@vegaprotocol/types';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';
import { Link } from 'react-router-dom';
import { GradientText } from '../gradient-text';

export const MarketRewardBanner = (props: {
  metric: DispatchMetric | 'STAKING_REWARD_METRIC';
  gameId: string;
}) => {
  const t = useT();
  return (
    <p className="flex gap-1">
      <span className="font-bold">{t('Active reward')}: </span>
      <GradientText className="font-bold">
        {DispatchMetricLabels[props.metric]}
      </GradientText>
      <span>{DispatchMetricDescription[props.metric]}</span>
      <Link
        className="underline underline-offset-4"
        to={Links.COMPETITIONS_GAME(props.gameId)}
      >
        {t('Learn more')}
      </Link>
    </p>
  );
};
