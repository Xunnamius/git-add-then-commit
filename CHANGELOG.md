# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][10], and this project adheres to
[Semantic Versioning][11].

## [1.0.2][12] (2021-01-29)

### Bug Fixes

- **package.json:** fix dependency classifications ([8835260][13])

### Build System

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][14])

## [1.0.1][1] (2021-01-29)

### Build System

- **post-release-check.yml:** run executables as part of check ([6151b24][2])

# [1.0.0][3] (2021-01-29)

### Build System

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][4])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][5])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][6])
- **package.json:** add @types/yargs explicitly ([1183c65][7])

### Features

- Initial commit ([1e08a88][8])
- Upgrade to semantic-release-based pipeline ([3074894][9])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[3]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[4]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[5]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[6]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[7]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[8]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[9]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[10]: https://conventionalcommits.org
[11]: https://semver.org
[12]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[13]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[14]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
