import { StatsManager } from '@vegaprotocol/network-stats';
import { SearchForm } from '../../components/search';
import { useDocumentTitle } from '../../hooks/use-document-title';

const Home = () => {
  const classnames = 'mt-4 mb-4';
  useDocumentTitle();

  return (
    <section>
      <div className="p-20 max-sm:py-10 max-sm:px-0">
        <SearchForm />
      </div>
      <div className="px-20 max-sm:px-0">
        <StatsManager className={classnames} />
      </div>
    </section>
  );
};

export default Home;
