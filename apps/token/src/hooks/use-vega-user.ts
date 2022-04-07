import { useAppState } from "../contexts/app-state/app-state-context";

export function useVegaUser() {
  const { appState } = useAppState();

  return {
    vegaKeys: appState.vegaKeys,
    currVegaKey: appState.currVegaKey,
  };
}
