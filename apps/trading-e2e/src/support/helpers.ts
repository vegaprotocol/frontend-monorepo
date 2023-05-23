export const selectAsset = (assetIndex: number) => {
  cy.log(`selecting asset: ${assetIndex}`);
  cy.getByTestId('select-asset').click();
  cy.get('[data-testid="rich-select-option"]').eq(assetIndex).click();

  // The asset only gets set once the queries (getWithdrawThreshold, getDelay)
  // against the Ethereum change resolve, we should fix this but for now just force
  // some wait time
  // eslint-disable-next-line
  cy.wait(100);
};
