import { addSeconds, millisecondsToSeconds } from 'date-fns';

const walletName = Cypress.env('vegaWalletName');
const walletPubKey = Cypress.env('vegaWalletPublicKey');
const walletLocation = Cypress.env('vegaWalletLocation');
const walletPassphraseFile = './src/fixtures/wallet/passphrase';

Cypress.Commands.add('SubmitShortEnactmentProposal', () => {
  const MIN_CLOSE_SEC = 8;
  const MIN_ENACT_SEC = 5;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const enactmentDate = addSeconds(closingDate, MIN_ENACT_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  const enactmentTimestamp = millisecondsToSeconds(enactmentDate.getTime());

  cy.exec(
    `vegawallet transaction send --wallet ${walletName} --pubkey ${walletPubKey} -p ${walletPassphraseFile} --network DV '{
      "proposalSubmission": {
        "rationale": {
          "title": "Add New proposal with short enactment",
          "description": "E2E enactment test"
        },
        "terms": {
          "updateNetworkParameter": {
              "changes": {
                  "key": "governance.proposal.updateNetParam.minProposerBalance",
                  "value": "2"
              }
          },
          "closingTimestamp": ${closingTimestamp},
          "enactmentTimestamp": ${enactmentTimestamp}
      }
      }
     }' --home ${walletLocation}`,
    { failOnNonZeroExit: false }
  )
    .its('stderr')
    .should('contain', '');
});
