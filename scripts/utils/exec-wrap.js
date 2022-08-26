module.exports = ({ cmd, errMessage }) => {
  console.log(`executing: "${cmd}"`);
  try {
    const result = execSync(cmd, { cwd: appRoot, stdout: process.stdout });
    return result.toString();
  } catch (err) {
    throw new Error(errMessage);
  }
};
