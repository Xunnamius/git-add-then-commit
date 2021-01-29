# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][15], and this project adheres to
[Semantic Versioning][16].

## [1.0.4][17] (2021-01-29)

### Bug Fixes

- **index.ts:** add more helpful error messages ([76e58c2][18])
- **post-release-check.yml:** ensure check-compat depends on sleeper job
  ([22592a4][19])

## [1.0.3][1] (2021-01-29)

### Build System

- **post-release-check.yml:** add five minute wait for npm updates
  ([ec7083e][2])

## [1.0.2][3] (2021-01-29)

### Bug Fixes

- **package.json:** fix dependency classifications ([8835260][4])

### Build System

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][5])

## [1.0.1][6] (2021-01-29)

### Build System

- **post-release-check.yml:** run executables as part of check ([6151b24][7])

# [1.0.0][8] (2021-01-29)

### Build System

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][9])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][10])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][11])
- **package.json:** add @types/yargs explicitly ([1183c65][12])

### Features

- Initial commit ([1e08a88][13])
- Upgrade to semantic-release-based pipeline ([3074894][14])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.2...v1.0.3
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec7083eab998634a7d85da2d669e332ceaa0c0c2
[3]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[4]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[5]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
[6]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[7]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[8]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[9]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[10]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[11]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[12]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[13]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[14]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[15]: https://conventionalcommits.org
[16]: https://semver.org
[17]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.3...v1.0.4
[18]:
  https://github.com/Xunnamius/git-add-then-commit/commit/76e58c25acd362cedb3d7742dbdd248c6026c952
[19]:
  https://github.com/Xunnamius/git-add-then-commit/commit/22592a4742648394dc15e28d8767b376a9bbacba
