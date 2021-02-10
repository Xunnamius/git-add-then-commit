# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][38], and this project adheres to
[Semantic Versioning][39].

## [1.1.6][40] (2021-02-10)

### Build System

- **webpack.config.js:** normalize webpack configuration across repos
  ([a4e209c][41])
- **webpack.config.js:** remove ES6 syntax from JS file ([db76562][42])

## [1.1.5][1] (2021-02-10)

### Build System

- **package.json:** update dependencies ([eb1dba9][2])

## [1.1.4][3] (2021-02-08)

### Build System

- **deps:** bump simple-git from 2.32.0 to 2.34.2 ([6c4feeb][4])

## [1.1.3][5] (2021-02-05)

### Build System

- **deps:** bump simple-git from 2.31.0 to 2.32.0 ([870bbc2][6])

## [1.1.2][7] (2021-02-04)

### Bug Fixes

- Ensure derived scopes are lowercased ([3ec4273][8])

### Build System

- **package.json:** update deps ([41cf8f7][9])

## [1.1.1][10] (2021-01-31)

### Bug Fixes

- **git-lib.ts:** fix bug where incorrect staged paths were returned
  ([228dd5d][11])
- Better error message handling and testing ([e3c34c0][12])

### Build System

- **webpack.config.js:** externalize json imports ([3c8f855][13])

# [1.1.0][14] (2021-01-30)

### Build System

- **babel.config.js:** update to transform-default-named-imports plugin
  ([6414981][15])

### Features

- Update to new internal implementations; fix several bugs ([d2394e5][16])

## [1.0.6][17] (2021-01-29)

### Bug Fixes

- **index.ts:** ensure yargs parses arguments before cwd check ([063ece4][18])

## [1.0.5][19] (2021-01-29)

### Bug Fixes

- **post-release-check.yml:** use correct job name ([6b5020b][20])

## [1.0.4][21] (2021-01-29)

### Bug Fixes

- **index.ts:** add more helpful error messages ([76e58c2][22])
- **post-release-check.yml:** ensure check-compat depends on sleeper job
  ([22592a4][23])

## [1.0.3][24] (2021-01-29)

### Build System

- **post-release-check.yml:** add five minute wait for npm updates
  ([ec7083e][25])

## [1.0.2][26] (2021-01-29)

### Bug Fixes

- **package.json:** fix dependency classifications ([8835260][27])

### Build System

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][28])

## [1.0.1][29] (2021-01-29)

### Build System

- **post-release-check.yml:** run executables as part of check ([6151b24][30])

# [1.0.0][31] (2021-01-29)

### Build System

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][32])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][33])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][34])
- **package.json:** add @types/yargs explicitly ([1183c65][35])

### Features

- Initial commit ([1e08a88][36])
- Upgrade to semantic-release-based pipeline ([3074894][37])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.4...v1.1.5
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/eb1dba93a66257fa06956d1f754d67f07a7267e3
[3]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.3...v1.1.4
[4]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6c4feeb715371890e3ef6b6f16c912c025470290
[5]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.2...v1.1.3
[6]:
  https://github.com/Xunnamius/git-add-then-commit/commit/870bbc20d74901bacba2b381e03357f5c1237ddf
[7]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.1...v1.1.2
[8]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3ec4273115289ab48b38b35a214d0e23b507a13e
[9]:
  https://github.com/Xunnamius/git-add-then-commit/commit/41cf8f7ec2bee7be9bdfa9d483678600daf2a27d
[10]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.0...v1.1.1
[11]:
  https://github.com/Xunnamius/git-add-then-commit/commit/228dd5dac079866cfae39baa1581c918bf29cfb1
[12]:
  https://github.com/Xunnamius/git-add-then-commit/commit/e3c34c05143a7fae1f1fd9d3f509b002f35b5886
[13]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3c8f8558c445e1ebbb5c9ca36cb83fc74df46895
[14]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.6...v1.1.0
[15]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6414981f96d88bee2230725a3e6a0c98dd84da77
[16]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d2394e515ab103d82f02cabb7e472ce42fcd299c
[17]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.5...v1.0.6
[18]:
  https://github.com/Xunnamius/git-add-then-commit/commit/063ece4205774b2b5a768cf34223dbd8ead72701
[19]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.4...v1.0.5
[20]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6b5020b7607758fce2f916bba2de5f5f05e416aa
[21]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.3...v1.0.4
[22]:
  https://github.com/Xunnamius/git-add-then-commit/commit/76e58c25acd362cedb3d7742dbdd248c6026c952
[23]:
  https://github.com/Xunnamius/git-add-then-commit/commit/22592a4742648394dc15e28d8767b376a9bbacba
[24]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.2...v1.0.3
[25]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec7083eab998634a7d85da2d669e332ceaa0c0c2
[26]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[27]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[28]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
[29]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[30]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[31]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[32]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[33]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[34]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[35]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[36]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[37]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[38]: https://conventionalcommits.org
[39]: https://semver.org
[40]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.5...v1.1.6
[41]:
  https://github.com/Xunnamius/git-add-then-commit/commit/a4e209c1093b0eb07bbe82e7d3088fe74d55ff86
[42]:
  https://github.com/Xunnamius/git-add-then-commit/commit/db76562fac7f5db3dede61ffc223952bc8110f5f
