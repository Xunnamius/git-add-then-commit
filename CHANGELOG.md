# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][22], and this project adheres to
[Semantic Versioning][23].

# [1.1.0][24] (2021-01-30)

### Build System

- **babel.config.js:** update to transform-default-named-imports plugin
  ([6414981][25])

### Features

- Update to new internal implementations; fix several bugs ([d2394e5][26])

## [1.0.6][1] (2021-01-29)

### Bug Fixes

- **index.ts:** ensure yargs parses arguments before cwd check ([063ece4][2])

## [1.0.5][3] (2021-01-29)

### Bug Fixes

- **post-release-check.yml:** use correct job name ([6b5020b][4])

## [1.0.4][5] (2021-01-29)

### Bug Fixes

- **index.ts:** add more helpful error messages ([76e58c2][6])
- **post-release-check.yml:** ensure check-compat depends on sleeper job
  ([22592a4][7])

## [1.0.3][8] (2021-01-29)

### Build System

- **post-release-check.yml:** add five minute wait for npm updates
  ([ec7083e][9])

## [1.0.2][10] (2021-01-29)

### Bug Fixes

- **package.json:** fix dependency classifications ([8835260][11])

### Build System

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][12])

## [1.0.1][13] (2021-01-29)

### Build System

- **post-release-check.yml:** run executables as part of check ([6151b24][14])

# [1.0.0][15] (2021-01-29)

### Build System

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][16])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][17])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][18])
- **package.json:** add @types/yargs explicitly ([1183c65][19])

### Features

- Initial commit ([1e08a88][20])
- Upgrade to semantic-release-based pipeline ([3074894][21])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.5...v1.0.6
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/063ece4205774b2b5a768cf34223dbd8ead72701
[3]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.4...v1.0.5
[4]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6b5020b7607758fce2f916bba2de5f5f05e416aa
[5]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.3...v1.0.4
[6]:
  https://github.com/Xunnamius/git-add-then-commit/commit/76e58c25acd362cedb3d7742dbdd248c6026c952
[7]:
  https://github.com/Xunnamius/git-add-then-commit/commit/22592a4742648394dc15e28d8767b376a9bbacba
[8]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.2...v1.0.3
[9]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec7083eab998634a7d85da2d669e332ceaa0c0c2
[10]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[11]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[12]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
[13]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[14]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[15]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[16]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[17]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[18]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[19]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[20]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[21]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[22]: https://conventionalcommits.org
[23]: https://semver.org
[24]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.6...v1.1.0
[25]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6414981f96d88bee2230725a3e6a0c98dd84da77
[26]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d2394e515ab103d82f02cabb7e472ce42fcd299c
