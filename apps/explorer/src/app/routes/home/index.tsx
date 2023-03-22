import { StatsManager } from '@vegaprotocol/network-stats';
import { useDocumentTitle } from '../../hooks/use-document-title';

const Home = () => {
  const classnames = 'mt-4 grid grid-cols-1 lg:grid-cols-2 lg:gap-4';
  useDocumentTitle();

  return (
    <section>
      <StatsManager className={classnames} />
    </section>
  );
};

export default Home;
