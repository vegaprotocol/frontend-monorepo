import {
  ClaimAction,
  ClaimActionType,
  claimReducer,
  initialClaimState,
} from "./claim-reducer";

it("Handles large denomination numbers", () => {
  const state = initialClaimState;
  const action: ClaimAction = {
    type: ClaimActionType.SET_DATA_FROM_URL,
    decimals: 18,
    data: {
      amount: "200000000000000000000",
      s: "0x4fec6bd49afc7211748305b0f1d76ce5a6a7a36dafe70ceb0ac3d5c5657f08c8",
      r: "0x7dce46208aa73c2cfe0241781beea5f27cbbe973ac1e1fac83c52ee897bef0f4",
      v: "28",
      target: "",
      trancheId: "5",
      expiry: "4294967295",
    },
  };

  const updatedState = claimReducer(state, action);

  expect(updatedState.claimData?.claim.amount.toString()).toEqual("200");
});
