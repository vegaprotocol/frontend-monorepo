# Release

## Step by step guide

### Mainnet

Once it has been agreed we are ready to release follow the steps below.

1. Create a branch `chore/release-v0.x.x` from `develop`.
1. On the new branch, bump the version in `package.json` and commit it.
1. Create a pull request to merge into `main` from `chore/release-v0.x.x`. This will build and create preview links and run all linting and tests.
1. Do any testing and manual checks at this point.
1. Commit any required fixes to `chiore/release-v0.x.x`
1. When ready, merge the pull request with a merge commit. Important! Do not squash, or history will be lost.
1. Tag the merge commit on `main` with `v0.x.x` and push it.
1. Merge `chore/release-v0.x.x` to develop.
1. Reset the desired release branch to the tag, and then push to start the deployment. `git checkout release/mainnet` then `git reset --hard v0.x.x`
1. Go to the tag in github and create the release and generate the release notes.
1. Publish the release
1. Check back and ensure the 'After release' action ran successfully. This should append IPFS information to the release notes.

### Fairground

1. Tag the desired commit on `develop` as pre-release. `v0.x.x.-preview.1`
2. Reset the desired release branch to the tag
3. Push to deploy
