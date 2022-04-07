const execSync = require('child_process').execSync;
const getAffected = `CI=true npx nx@13.8.3 print-affected --yes`;
const cwd = execSync('pwd').toString();
const ls = execSync('ls').toString();

const currentProject = process.env.NX_PROJECT_NAME;
console.log(ls);
console.log(`Checking affected for: ${currentProject} in ${cwd}`);

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

console.log(`Did this project change? ${isThisProjectChanged}`);

process.exitCode = isThisProjectChanged;
