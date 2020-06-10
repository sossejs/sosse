# Contributing

## Building

This projects includes all its development scripts in the script folder.

Mostly used scripts:

- Build Code: `./scripts/build.js`
- Reformat Code: `./scripts/reformat.js`
- Run tests: `./scripts/test.js`
- Build docs html: `./scripts/docs.js`

## Releasing

Before releasing make sure that all changes for the release are committed and in the proper branch merged.

To start the release workflow, run: `./scripts/before-publish.js`
This workflow will run through:

- Reformat
- Build
- Test & Coverage

Afterwards you are notified that you should run: `npx standard-version -a`
This increases the version in package.json, updates README.md CHANGELOG.md and docs and adds a new git tag with the proper version.

Then push the tag (something like `git push --tags`) and if needed publish to npm with: `npm publish`
