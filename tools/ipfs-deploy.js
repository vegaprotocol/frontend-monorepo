#!/usr/bin/env node

/**
 * Runs the fleek deploy process based on nx:affected, but only for sites
 * that have a .fleek.json file
 */

// Fleek CLI requires this variable to be set
if (!process.env['FLEEK_API_KEY']) {
  console.error('Error: FLEEK_API_KEY must be set');
  process.exit(1);
}

const { existsSync } = require('fs');
const { execSync } = require('child_process');

// The folder containing NX projects
const projectPath = './apps/';
// The Fleek project file, the existence indicates a deployed app
const fleekFile = '.fleek.json';
// Command to run in each app that needs to be deployed
const deployCommand = 'npx @fleekhq/fleek-cli@0.1.8 site:deploy';

// Await piped input
process.stdin.resume();
process.stdin.setEncoding('utf8');

// This hangs for input, and process.exit ensures it only triggers one
process.stdin.on('data', function (affectedProjectsString) {
  // If there is no input, nothing is affected. Bail early.
  if (affectedProjectsString.trim().length === 0) {
    console.log('Success: No projects affected');
    process.exit(0);
  }

  // Handle multiple projects or a single project being affected
  let affectedProjects =
    affectedProjectsString.indexOf(',') !== -1
      ? affectedProjectsString.split(',')
      : [affectedProjectsString.trim()];

  let affectedProjectsCount = 0;

  affectedProjects.forEach((p) => {
    const cleanedProjectName = p.trim();

    // Path (from cwd) for the project, used for execSync if it's a fleek project
    const project = `${projectPath}${cleanedProjectName}/`;

    // Specific file to check for the existence of
    const fleekFilePath = `${project}${fleekFile}`;

    if (existsSync(fleekFilePath)) {
      affectedProjectsCount++;

      console.group(`${cleanedProjectName} requires deployment`);

      // This will throw if it fails to trigger
      execSync(deployCommand, { cwd: project });

      console.groupEnd();
    }
  });

  // If we made it here, either we didn't have any projects to deploy...
  if (affectedProjectsCount === 0) {
    console.log('Success: No Fleek projects affected');
  } else {
    // ... or all the projects deployed successfully...
    console.log(`Success: ${affectedProjectsCount} deployments triggered`);
  }
  // ... so either way it's considered success
  process.exit(0);
});
