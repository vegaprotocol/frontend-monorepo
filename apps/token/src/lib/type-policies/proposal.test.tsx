import { getProposalName } from "./proposal";

it("New market", () => {
  const name = getProposalName({
    __typename: "NewMarket",
    decimalPlaces: 1,
    instrument: {
      __typename: "InstrumentConfiguration",
      name: "Some market",
    },
    metadata: [],
  });
  expect(name).toEqual("New Market: Some market");
});

it("New asset", () => {
  const name = getProposalName({
    __typename: "NewAsset",
    symbol: "FAKE",
    source: {
      __typename: "ERC20",
      contractAddress: "0x0",
    },
  });
  expect(name).toEqual("New Asset: FAKE");
});

it("Update market", () => {
  const name = getProposalName({
    __typename: "UpdateMarket",
    marketId: "MarketId",
  });
  expect(name).toEqual("Update Market: MarketId");
});

it("Update network", () => {
  const name = getProposalName({
    __typename: "UpdateNetworkParameter",
    networkParameter: {
      __typename: "NetworkParameter",
      key: "key",
      value: "value",
    },
  });
  expect(name).toEqual("Update Network: key");
});

it("Freeform network", () => {
  const name = getProposalName({
    __typename: "NewFreeform",
    hash: "0x0",
    url: "Earl",
    description: "Something else",
  });
  expect(name).toEqual("Freeform: 0x0");
});

it("Renders unknown proposal if it's a different proposal type", () => {
  const name = getProposalName({
    // @ts-ignore
    __typename: "Foo",
  });
  expect(name).toEqual("Unknown Proposal");
});
