# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][32], and this project adheres to
[Semantic Versioning][33].

## [1.1.3][34] (2021-02-05)

### Build System

- **deps:** bump simple-git from 2.31.0 to 2.32.0 ([c22c4d0][35])
- **deps:** bump simple-git from 2.31.0 to 2.32.0 ([870bbc2][36])

## [1.1.2][1] (2021-02-04)

### Bug Fixes

- Ensure derived scopes are lowercased ([3ec4273][2])

### Build System

- **package.json:** update deps ([41cf8f7][3])

## [1.1.1][4] (2021-01-31)

### Bug Fixes

- **git-lib.ts:** fix bug where incorrect staged paths were returned
  ([228dd5d][5])
- Better error message handling and testing ([e3c34c0][6])

### Build System

- **webpack.config.js:** externalize json imports ([3c8f855][7])

# [1.1.0][8] (2021-01-30)

### Build System

- **babel.config.js:** update to transform-default-named-imports plugin
  ([6414981][9])

### Features

- Update to new internal implementations; fix several bugs ([d2394e5][10])

## [1.0.6][11] (2021-01-29)

### Bug Fixes

- **index.ts:** ensure yargs parses arguments before cwd check ([063ece4][12])

## [1.0.5][13] (2021-01-29)

### Bug Fixes

- **post-release-check.yml:** use correct job name ([6b5020b][14])

## [1.0.4][15] (2021-01-29)

### Bug Fixes

- **index.ts:** add more helpful error messages ([76e58c2][16])
- **post-release-check.yml:** ensure check-compat depends on sleeper job
  ([22592a4][17])

## [1.0.3][18] (2021-01-29)

### Build System

- **post-release-check.yml:** add five minute wait for npm updates
  ([ec7083e][19])

## [1.0.2][20] (2021-01-29)

### Bug Fixes

- **package.json:** fix dependency classifications ([8835260][21])

### Build System

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][22])

## [1.0.1][23] (2021-01-29)

### Build System

- **post-release-check.yml:** run executables as part of check ([6151b24][24])

# [1.0.0][25] (2021-01-29)

### Build System

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][26])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][27])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][28])
- **package.json:** add @types/yargs explicitly ([1183c65][29])

### Features

- Initial commit ([1e08a88][30])
- Upgrade to semantic-release-based pipeline ([3074894][31])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.1...v1.1.2
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3ec4273115289ab48b38b35a214d0e23b507a13e
[3]:
  https://github.com/Xunnamius/git-add-then-commit/commit/41cf8f7ec2bee7be9bdfa9d483678600daf2a27d
[4]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.0...v1.1.1
[5]:
  https://github.com/Xunnamius/git-add-then-commit/commit/228dd5dac079866cfae39baa1581c918bf29cfb1
[6]:
  https://github.com/Xunnamius/git-add-then-commit/commit/e3c34c05143a7fae1f1fd9d3f509b002f35b5886
[7]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3c8f8558c445e1ebbb5c9ca36cb83fc74df46895
[8]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.6...v1.1.0
[9]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6414981f96d88bee2230725a3e6a0c98dd84da77
[10]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d2394e515ab103d82f02cabb7e472ce42fcd299c
[11]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.5...v1.0.6
[12]:
  https://github.com/Xunnamius/git-add-then-commit/commit/063ece4205774b2b5a768cf34223dbd8ead72701
[13]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.4...v1.0.5
[14]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6b5020b7607758fce2f916bba2de5f5f05e416aa
[15]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.3...v1.0.4
[16]:
  https://github.com/Xunnamius/git-add-then-commit/commit/76e58c25acd362cedb3d7742dbdd248c6026c952
[17]:
  https://github.com/Xunnamius/git-add-then-commit/commit/22592a4742648394dc15e28d8767b376a9bbacba
[18]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.2...v1.0.3
[19]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec7083eab998634a7d85da2d669e332ceaa0c0c2
[20]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[21]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[22]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
[23]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[24]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[25]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[26]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[27]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[28]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[29]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[30]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[31]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[32]: https://conventionalcommits.org
[33]: https://semver.org
[34]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.2...v1.1.3
[35]:
  https://github.com/Xunnamius/git-add-then-commit/commit/c22c4d0eb1162c450cb768bfacaa8487d0bbe8b1
[36]:
  https://github.com/Xunnamius/git-add-then-commit/commit/870bbc20d74901bacba2b381e03357f5c1237ddf
