import { StatsManager } from '@vegaprotocol/network-stats';

const Home = () => {
  return (
    <section>
      <StatsManager className="mt-12 grid grid-cols-1 lg:grid-cols-2 lg:gap-16" />
    </section>
  );
};

export default Home;
