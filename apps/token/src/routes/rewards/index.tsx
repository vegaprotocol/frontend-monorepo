import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import { RewardsPage } from './home';

const Rewards = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);

  return <RewardsPage />;
};

export default Rewards;
