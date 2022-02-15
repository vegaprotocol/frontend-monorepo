import { DATA_SOURCES } from "../../config";
import useFetch from "../../hooks/use-fetch";
import { TendermintGenesisResponse } from "./tendermint-genesis-response";

const Genesis = () => {
  const { data: genesis } = useFetch<TendermintGenesisResponse>(
    `${DATA_SOURCES.tendermintUrl}/genesis`
  );
  return (
    <section>
      <h1>Genesis</h1>
      <pre>{JSON.stringify(genesis, null, "  ")}</pre>
    </section>
  );
};

export default Genesis;
