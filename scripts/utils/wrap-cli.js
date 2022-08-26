const parseCliArgs = require('./parse-cli-args');

module.exports = async function main(run, specs) {
  try {
    const config = parseCliArgs({
      specs,
      args: process.argv,
    });
    await run(config);
  } catch (err) {
    console.error(err);
  }
}
