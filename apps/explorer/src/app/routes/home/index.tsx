import { DATA_SOURCES } from '../../config';
import { StatsManager } from '@vegaprotocol/network-stats';
import { ENV } from '../../config/env';

const envName = ENV.envName;
const restEndpoint = DATA_SOURCES.restEndpoint;
const statsEndpoint = `${restEndpoint}/statistics`;
const nodesEndpoint = `${restEndpoint}/nodes-data`;

const Home = () => {
  return (
    <section>
      <StatsManager
        envName={envName}
        statsEndpoint={statsEndpoint}
        nodesEndpoint={nodesEndpoint}
        className="mt-12 grid grid-cols-1 lg:grid-cols-2 lg:gap-16"
      />
    </section>
  );
};

export default Home;
