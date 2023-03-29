const { execSync } = require('child_process');
const inquirer = require('inquirer');

const getTags = (take) => {
  const tags = execSync(
    "git for-each-ref --sort=taggerdate --format '%(refname)' refs/tags"
  )
    .toString()
    .trim()
    .split('\n')
    .map((t) => t.replace('refs/tags/', ''))
    .reverse()
    .slice(0, take);
  return tags;
};

const getReleaseBranches = () => {
  const branches = execSync('git branch --remote | grep origin/release/')
    .toString()
    .trim()
    .split('\n')
    .map((b) => b.trim().replace('origin/release/', ''));
  return branches;
};

const release = (tag, branch) => {
  const steps = [
    `git checkout release/${branch}`,
    'git pull',
    `git reset --hard ${tag}`,
    'git push --force',
  ];
  try {
    for (const cmd of steps) {
      const result = execSync(cmd).toString();
    }
  } catch (err) {
    console.error('Could not make a release');
  }
};

inquirer
  .prompt([
    {
      type: 'list',
      name: 'tag',
      message: 'What version would you like to release?',
      choices: getTags(),
    },
    {
      type: 'checkbox',
      name: 'envs',
      message: 'To what environment you wish to release?',
      choices: getReleaseBranches(),
      validate(answer) {
        return answer.length > 0;
      },
    },
  ])
  .then((answers) => {
    inquirer
      .prompt({
        type: 'confirm',
        name: 'sure',
        message: `Are you sure? This will release ${
          answers.tag
        } to ${answers.envs.join(', ')}`,
      })
      .then(() => {
        for (const env of answers.envs) {
          release(answers.tag, env);
        }
        execSync('git checkout develop');
      })
      .catch((err) => {
        console.log('Something went wrong', err.toString());
      });
  })
  .catch((err) => {
    console.log('Something went wrong', err.toString());
  });
