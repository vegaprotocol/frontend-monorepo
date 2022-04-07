import * as Sentry from "@sentry/react";
import { Tranche } from "@vegaprotocol/smart-contracts-sdk";
import React from "react";

import { useContracts } from "../contexts/contracts/contracts-context";

export function useTranches() {
  const { vesting } = useContracts();
  const [tranches, setTranches] = React.useState<Tranche[] | null>(null);
  const [error, setError] = React.useState<String | null>(null);

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await vesting.getAllTranches();
        setTranches(res);
      } catch (err) {
        Sentry.captureException(err);
        setError((err as Error).message);
      }
    };
    run();
  }, [vesting]);

  return {
    tranches,
    error,
  };
}
