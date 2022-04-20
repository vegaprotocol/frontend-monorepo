#!/usr/bin/env node

/**
 * Run on Github by commits to master, this script:
 * 1. Gets all projects with a fleek configuration file
 *   2. Gets the last commit for the relevant site id
 *   3. Runs nx:affected for that commit ID and checks if the site has changed
 *     4. Calls deploy if it has
 *
 * This would probably be best as an NX task, but the circular nature of getting
 * the fleek ID for the project, then checking if it was affected didn't fit within the
 * build-only-affected cycle, and as each fleek deploy will have been triggered by
 * a different commit, it seemed best to do this outwith nx. Feel free to re-implement
 * this if the assumptions are wrong.
 *
 * It has also been written to skip external dependencies.
 */
const { existsSync, readdirSync, readFileSync } = require('fs');
const { execSync } = require('child_process');

/**
 * Parses the last commit hash out of the Fleek API response
 * @param {String} siteId
 * @returns string Last commit that triggered a build
 */
function getFleekLastBuildCommit(siteId) {
  const curl = `curl 'https://api.fleek.co/graphql' --silent -X POST -H 'Accept: */*' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Authorization: ${process.env['FLEEK_API_KEY']}' --data-raw '{"query":"{getSiteById(siteId: \\"${siteId}\\"){publishedDeploy{repository{commit}}}}","variables":null}'`;
  const fleekRes = execSync(curl);

  const res = JSON.parse(fleekRes.toString());
  let commit = res.data.getSiteById.publishedDeploy.repository.commit;

  return commit;
}

/**
 * Triggers a Fleek build of the latest code via GraphQL
 * @param {String} siteId
 * @returns
 */
function triggerDeploy(siteId) {
  const curl = `curl 'https://api.fleek.co/graphql' --silent -X POST -H 'Accept: */*' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Authorization: ${process.env['FLEEK_API_KEY']}' --data-raw '{"query":"mutation {triggerDeploy(commit: \\"HEAD\\", siteId: \\"${siteId}\\"){status}}","variables":null}'`;
  const fleekRes = execSync(curl);

  JSON.parse(fleekRes.toString());

  // Will have thrown if it failed
  return true;
}

// The folder containing NX projects
const projectPath = './apps/';
// The Fleek project file, the existence indicates a deployed app
const fleekFile = '.fleek.json';
// Some simple stats for the end
let fleekProjects = 0;
let deployedProjects = 0;

// Fleek CLI requires this variable to be set
if (!process.env['FLEEK_API_KEY']) {
  console.error('Error: FLEEK_API_KEY must be set');
  process.exit(1);
}

readdirSync(projectPath).forEach((proj) => {
  try {
    const config = `${projectPath}${proj}/${fleekFile}`;
    if (!existsSync(config)) {
      // No fleek file, skip it
      return;
    }

    fleekProjects++;

    console.group(proj);

    // The UID for the site according to the config
    let siteId;

    try {
      const fleekConfig = JSON.parse(readFileSync(config));
      siteId = fleekConfig.site.id;

      console.log(`Fleek site ID: ${siteId}`);
    } catch (e) {
      console.error(`Failed to read Fleek site id for ${proj}`);
      return;
    }

    // The last commit that triggered a build
    let baseCommit;

    try {
      baseCommit = getFleekLastBuildCommit(siteId);

      console.log(`Last deploy: ${baseCommit}`);
    } catch (e) {
      console.error(`Failed to fetch last deploy for ${proj}`);
      return;
    }

    // Now run nx affected
    let isAffected;

    try {
      const affectedSinceCommit = execSync(
        `yarn nx print-affected --base=${baseCommit} --head=HEAD --select=projects`
      );

      // Detect if this project name is in output, taking care not to match names that are
      // included in other projects - `trading`, `trading-e2e` is a current example
      isAffected = affectedSinceCommit
        .toString()
        .split(',')
        .map((v) => v.trim())
        .includes(proj);
    } catch (e) {
      console.error(`Failed to run nx:affected for ${baseCommit}:master`);
      return;
    }

    if (isAffected) {
      console.log(`Triggering deploy for: ${siteId}`);
      deployedProjects++;

      try {
        triggerDeploy(siteId);
      } catch (e) {
        console.error(`Failed to trigger deploy for ${proj}`);
        process.exit(1);
      }
    } else {
      console.log(`Has not changed since last build, skipping...`);
    }

    console.groupEnd();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});

console.log(`Fleek projects: ${fleekProjects}`);
console.log(`Deploys triggered: ${deployedProjects}`);

process.exit(0);
