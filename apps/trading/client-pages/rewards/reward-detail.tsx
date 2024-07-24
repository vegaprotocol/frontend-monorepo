import { useParams } from 'react-router-dom';

export const RewardsDetail = () => {
  const params = useParams();

  return <div>{params.rewardId}</div>;
};
