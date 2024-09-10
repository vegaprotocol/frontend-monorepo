import {
  type DispatchMetric,
  DispatchMetricDescription,
  DispatchMetricLabels,
} from '@vegaprotocol/types';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';
import { Link } from 'react-router-dom';

export const MarketRewardBanner = (props: {
  metric: DispatchMetric | 'STAKING_REWARD_METRIC';
  gameId: string;
}) => {
  const t = useT();
  return (
    <span className="flex gap-1">
      <span className="font-bold antialiased">{t('Active reward')}: </span>
      <span className="font-bold antialiased">
        {DispatchMetricLabels[props.metric]}
      </span>
      <span>{DispatchMetricDescription[props.metric]}</span>
      <Link className="underline" to={Links.COMPETITIONS_GAME(props.gameId)}>
        {t('Learn more')}
      </Link>
    </span>
  );
};
