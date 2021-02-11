# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][43], and this project adheres to
[Semantic Versioning][44].

## [1.1.8][45] (2021-02-11)

### Build System

- Test-integration-node-cli => test-integration-client ([ae836eb][46])

## [1.1.7][1] (2021-02-11)

### Build System

- **package.json:** update to proper forked dependencies ([25667ac][2])

## [1.1.6][3] (2021-02-10)

### Build System

- **webpack.config.js:** normalize webpack configuration across repos
  ([a4e209c][4])
- **webpack.config.js:** remove ES6 syntax from JS file ([db76562][5])

## [1.1.5][6] (2021-02-10)

### Build System

- **package.json:** update dependencies ([eb1dba9][7])

## [1.1.4][8] (2021-02-08)

### Build System

- **deps:** bump simple-git from 2.32.0 to 2.34.2 ([6c4feeb][9])

## [1.1.3][10] (2021-02-05)

### Build System

- **deps:** bump simple-git from 2.31.0 to 2.32.0 ([870bbc2][11])

## [1.1.2][12] (2021-02-04)

### Bug Fixes

- Ensure derived scopes are lowercased ([3ec4273][13])

### Build System

- **package.json:** update deps ([41cf8f7][14])

## [1.1.1][15] (2021-01-31)

### Bug Fixes

- **git-lib.ts:** fix bug where incorrect staged paths were returned
  ([228dd5d][16])
- Better error message handling and testing ([e3c34c0][17])

### Build System

- **webpack.config.js:** externalize json imports ([3c8f855][18])

# [1.1.0][19] (2021-01-30)

### Build System

- **babel.config.js:** update to transform-default-named-imports plugin
  ([6414981][20])

### Features

- Update to new internal implementations; fix several bugs ([d2394e5][21])

## [1.0.6][22] (2021-01-29)

### Bug Fixes

- **index.ts:** ensure yargs parses arguments before cwd check ([063ece4][23])

## [1.0.5][24] (2021-01-29)

### Bug Fixes

- **post-release-check.yml:** use correct job name ([6b5020b][25])

## [1.0.4][26] (2021-01-29)

### Bug Fixes

- **index.ts:** add more helpful error messages ([76e58c2][27])
- **post-release-check.yml:** ensure check-compat depends on sleeper job
  ([22592a4][28])

## [1.0.3][29] (2021-01-29)

### Build System

- **post-release-check.yml:** add five minute wait for npm updates
  ([ec7083e][30])

## [1.0.2][31] (2021-01-29)

### Bug Fixes

- **package.json:** fix dependency classifications ([8835260][32])

### Build System

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][33])

## [1.0.1][34] (2021-01-29)

### Build System

- **post-release-check.yml:** run executables as part of check ([6151b24][35])

# [1.0.0][36] (2021-01-29)

### Build System

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][37])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][38])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][39])
- **package.json:** add @types/yargs explicitly ([1183c65][40])

### Features

- Initial commit ([1e08a88][41])
- Upgrade to semantic-release-based pipeline ([3074894][42])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.6...v1.1.7
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/25667ac53116bddcfd22ca9befef34078148a9f6
[3]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.5...v1.1.6
[4]:
  https://github.com/Xunnamius/git-add-then-commit/commit/a4e209c1093b0eb07bbe82e7d3088fe74d55ff86
[5]:
  https://github.com/Xunnamius/git-add-then-commit/commit/db76562fac7f5db3dede61ffc223952bc8110f5f
[6]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.4...v1.1.5
[7]:
  https://github.com/Xunnamius/git-add-then-commit/commit/eb1dba93a66257fa06956d1f754d67f07a7267e3
[8]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.3...v1.1.4
[9]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6c4feeb715371890e3ef6b6f16c912c025470290
[10]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.2...v1.1.3
[11]:
  https://github.com/Xunnamius/git-add-then-commit/commit/870bbc20d74901bacba2b381e03357f5c1237ddf
[12]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.1...v1.1.2
[13]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3ec4273115289ab48b38b35a214d0e23b507a13e
[14]:
  https://github.com/Xunnamius/git-add-then-commit/commit/41cf8f7ec2bee7be9bdfa9d483678600daf2a27d
[15]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.0...v1.1.1
[16]:
  https://github.com/Xunnamius/git-add-then-commit/commit/228dd5dac079866cfae39baa1581c918bf29cfb1
[17]:
  https://github.com/Xunnamius/git-add-then-commit/commit/e3c34c05143a7fae1f1fd9d3f509b002f35b5886
[18]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3c8f8558c445e1ebbb5c9ca36cb83fc74df46895
[19]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.6...v1.1.0
[20]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6414981f96d88bee2230725a3e6a0c98dd84da77
[21]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d2394e515ab103d82f02cabb7e472ce42fcd299c
[22]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.5...v1.0.6
[23]:
  https://github.com/Xunnamius/git-add-then-commit/commit/063ece4205774b2b5a768cf34223dbd8ead72701
[24]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.4...v1.0.5
[25]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6b5020b7607758fce2f916bba2de5f5f05e416aa
[26]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.3...v1.0.4
[27]:
  https://github.com/Xunnamius/git-add-then-commit/commit/76e58c25acd362cedb3d7742dbdd248c6026c952
[28]:
  https://github.com/Xunnamius/git-add-then-commit/commit/22592a4742648394dc15e28d8767b376a9bbacba
[29]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.2...v1.0.3
[30]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec7083eab998634a7d85da2d669e332ceaa0c0c2
[31]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[32]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[33]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
[34]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[35]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[36]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[37]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[38]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[39]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[40]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[41]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[42]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[43]: https://conventionalcommits.org
[44]: https://semver.org
[45]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.7...v1.1.8
[46]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ae836eb4ab2b88700e0f22deb880049d779e79f4
