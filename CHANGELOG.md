# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][13], and this project adheres to
[Semantic Versioning][14].

## [1.0.3][15] (2021-01-29)

### Build System

- **post-release-check.yml:** add five minute wait for npm updates
  ([ec7083e][16])

## [1.0.2][1] (2021-01-29)

### Bug Fixes

- **package.json:** fix dependency classifications ([8835260][2])

### Build System

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][3])

## [1.0.1][4] (2021-01-29)

### Build System

- **post-release-check.yml:** run executables as part of check ([6151b24][5])

# [1.0.0][6] (2021-01-29)

### Build System

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][7])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][8])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][9])
- **package.json:** add @types/yargs explicitly ([1183c65][10])

### Features

- Initial commit ([1e08a88][11])
- Upgrade to semantic-release-based pipeline ([3074894][12])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[3]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
[4]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[5]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[6]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[7]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[8]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[9]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[10]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[11]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[12]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[13]: https://conventionalcommits.org
[14]: https://semver.org
[15]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.2...v1.0.3
[16]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec7083eab998634a7d85da2d669e332ceaa0c0c2
