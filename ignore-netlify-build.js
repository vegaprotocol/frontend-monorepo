const execSync = require('child_process').execSync;
const cwd = execSync('pwd').toString();
const ls = execSync('ls').toString();

const currentProject = process.env.NX_PROJECT_NAME;
const lastBuild = process.env.CACHED_COMMIT_REF;
const latestCommit = 'HEAD';

const getAffected = `CI=true npx nx@13.8.3 print-affected --base=${lastBuild} --head=${latestCommit}`;
const nxr = `CI=true npx nx@13.8.3 report`;

console.log(`Checking affected for: ${currentProject} in ${cwd}`);
console.group();

console.log(ls);
console.log(nxr);

const output = execSync(getAffected).toString();

console.dir(output);

//get the list of changed projects from the output
const changedProjects = JSON.parse(output).projects; // array of affected projects
console.dir(changedProjects);
const isThisProjectChanged = changedProjects.some(
  (project) => project === currentProject
)
  ? 0
  : 1;
console.groupEnd();

console.log(`Did this project change? ${isThisProjectChanged}`);

process.exitCode = isThisProjectChanged;
