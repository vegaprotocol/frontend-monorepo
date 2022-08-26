import { StatsManager } from '@vegaprotocol/network-stats';

const Home = () => {
  const classnames = 'mt-12 grid grid-cols-1 lg:grid-cols-2 lg:gap-16';
  return (
    <section>
      <StatsManager className={classnames} />
    </section>
  );
};

export default Home;
