const currentProject = process.env.NX_PROJECT_NAME;
const execSync = require('child_process').execSync;
const getAffected = `yarn nx print-affected`;
const output = execSync(getAffected).toString();
//get the list of changed projects from the output
const changedProjects = JSON.parse(output).projects; // array of affected projects
process.exitCode = changedProjects.some((project) => project === currentProject)
  ? 0
  : 1;
