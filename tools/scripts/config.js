// Add a valid nx project here if you want it to deploy and be tested
// for all commits to develop
const AppsThatDeployToMainnetFromDevelop = new Set([
  'multisig-signer',
  'static',
  'ui-toolkit',
]);

const AppsThatDoNotDeployToMainnet = new Set(['trading']);

module.exports = {
  AppsThatDeployToMainnetFromDevelop,
  AppsThatDoNotDeployToMainnet,
};
