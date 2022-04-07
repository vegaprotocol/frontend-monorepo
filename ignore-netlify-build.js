const execSync = require('child_process').execSync;
const getAffected = `npx nx@13.8.3 print-affected`;
const cwd = execSync('pwd').toString();
const ls = execSync('ls').toString();


const currentProject = process.env.NX_PROJECT_NAME;
console.log(`Checking affected for: ${currentProject} in ${cwd}`);
const output = execSync(getAffected).toString();

console.dir(output);

//get the list of changed projects from the output
const changedProjects = JSON.parse(output).projects; // array of affected projects
process.exitCode = changedProjects.some((project) => project === currentProject)
  ? 0
  : 1;
