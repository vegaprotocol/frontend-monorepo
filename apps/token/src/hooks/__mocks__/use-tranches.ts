import { Tranche } from "@vegaprotocol/smart-contracts-sdk";
import React from "react";

import { useContracts } from "../../contexts/contracts/contracts-context";
import mock from "./tranches-mock";

export function useTranches() {
  const { vesting } = useContracts();
  const [tranches, setTranches] = React.useState<Tranche[] | null>(null);
  const [error, setError] = React.useState<String | null>(null);

  React.useEffect(() => {
    const run = async () => {
      try {
        setTranches(mock);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    run();
  }, [vesting]);

  return { tranches, error };
}
