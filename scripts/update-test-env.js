const fs = require('fs');
const path = require('path');

const dirs = fs
  .readdirSync('./apps', { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .filter((dir) => !dir.endsWith('e2e'));

for (const dir of dirs) {
  const basePath = path.resolve(`./apps/${dir}`);
  const copyPath = `${basePath}/.env.testnet`;
  const destinationPath = `${basePath}/.env`;
  const cypressEnvPath = `${basePath}/cypress.env.testnet.json`;
  const renameCypressEnvPath = `${basePath}/cypress.env.json`;
  console.log(copyPath, fs.existsSync(copyPath));
  if (fs.existsSync(copyPath)) {
    console.log('exists', copyPath);
    fs.copyFileSync(copyPath, destinationPath);
  }
  if (fs.existsSync(cypressEnvPath)) {
    console.log('exists', cypressEnvPath);
    fs.renameSync(cypressEnvPath, renameCypressEnvPath);
  }
}
