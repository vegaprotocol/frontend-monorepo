const path = require('node:path');
const { execSync } = require('node:child_process');

const appRoot = path.join(__dirname, '..', '..');

module.exports = ({ cmd, errMessage }) => {
  console.log(`executing: "${cmd}"`);
  try {
    const result = execSync(cmd, { cwd: appRoot, stdout: process.stdout });
    return result.toString();
  } catch (err) {
    throw new Error(errMessage);
  }
};
