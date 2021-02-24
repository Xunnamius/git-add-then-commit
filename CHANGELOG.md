# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][51], and this project adheres to
[Semantic Versioning][52].

# [2.0.0][53] (2021-02-24)

### Build System

- **integration-client.test.ts:** add integration test for new behavior
  ([d50fcdb][54])
- **integration-client.test.ts:** use the force ([7b9686d][55])
- **unit-index.test.ts:** 100% unit test coverage ([e5d6dcd][56])
- **unit-index.test.ts:** fix bug in test fixture ([d06de98][57])
- **unit-index.test.ts:** make tests consistent with new functionality
  ([072d37f][58])

### Features

- **index.ts:** add pre-add check to prevent clobbering the index
  ([93097b4][59]), closes [#17][60]

### BREAKING CHANGES

- **index.ts:** **attempting to add a path that is already staged will now**

result in an error unless --force is used. This is to prevent clobbering the git
index accidentally after running operations like `git add -p`

## [1.1.9][1] (2021-02-23)

### Bug Fixes

- **integration-client.test.ts:** add force:true to del operation ([6b698d0][2])
- Import fixes from cli lens ([27901cd][3])

### Build System

- **package.json:** bump jest timeout to 1 minute ([4c37f00][4])
- **package.json:** update dependencies ([8f59af8][5])
- Rename env-expect to expect-env ([8cdeda3][6])

## [1.1.8][7] (2021-02-11)

### Build System

- Test-integration-node-cli => test-integration-client ([ae836eb][8])

## [1.1.7][9] (2021-02-11)

### Build System

- **package.json:** update to proper forked dependencies ([25667ac][10])

## [1.1.6][11] (2021-02-10)

### Build System

- **webpack.config.js:** normalize webpack configuration across repos
  ([a4e209c][12])
- **webpack.config.js:** remove ES6 syntax from JS file ([db76562][13])

## [1.1.5][14] (2021-02-10)

### Build System

- **package.json:** update dependencies ([eb1dba9][15])

## [1.1.4][16] (2021-02-08)

### Build System

- **deps:** bump simple-git from 2.32.0 to 2.34.2 ([6c4feeb][17])

## [1.1.3][18] (2021-02-05)

### Build System

- **deps:** bump simple-git from 2.31.0 to 2.32.0 ([870bbc2][19])

## [1.1.2][20] (2021-02-04)

### Bug Fixes

- Ensure derived scopes are lowercased ([3ec4273][21])

### Build System

- **package.json:** update deps ([41cf8f7][22])

## [1.1.1][23] (2021-01-31)

### Bug Fixes

- **git-lib.ts:** fix bug where incorrect staged paths were returned
  ([228dd5d][24])
- Better error message handling and testing ([e3c34c0][25])

### Build System

- **webpack.config.js:** externalize json imports ([3c8f855][26])

# [1.1.0][27] (2021-01-30)

### Build System

- **babel.config.js:** update to transform-default-named-imports plugin
  ([6414981][28])

### Features

- Update to new internal implementations; fix several bugs ([d2394e5][29])

## [1.0.6][30] (2021-01-29)

### Bug Fixes

- **index.ts:** ensure yargs parses arguments before cwd check ([063ece4][31])

## [1.0.5][32] (2021-01-29)

### Bug Fixes

- **post-release-check.yml:** use correct job name ([6b5020b][33])

## [1.0.4][34] (2021-01-29)

### Bug Fixes

- **index.ts:** add more helpful error messages ([76e58c2][35])
- **post-release-check.yml:** ensure check-compat depends on sleeper job
  ([22592a4][36])

## [1.0.3][37] (2021-01-29)

### Build System

- **post-release-check.yml:** add five minute wait for npm updates
  ([ec7083e][38])

## [1.0.2][39] (2021-01-29)

### Bug Fixes

- **package.json:** fix dependency classifications ([8835260][40])

### Build System

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][41])

## [1.0.1][42] (2021-01-29)

### Build System

- **post-release-check.yml:** run executables as part of check ([6151b24][43])

# [1.0.0][44] (2021-01-29)

### Build System

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][45])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][46])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][47])
- **package.json:** add @types/yargs explicitly ([1183c65][48])

### Features

- Initial commit ([1e08a88][49])
- Upgrade to semantic-release-based pipeline ([3074894][50])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.8...v1.1.9
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6b698d02e6eaf71d3d3f61935763da0d97ebb065
[3]:
  https://github.com/Xunnamius/git-add-then-commit/commit/27901cdb658a7077638445c7a35bb29aec7d5f0a
[4]:
  https://github.com/Xunnamius/git-add-then-commit/commit/4c37f00927add15ee8c41f7342639bc84bf09bd0
[5]:
  https://github.com/Xunnamius/git-add-then-commit/commit/8f59af828f4fdbcdf7e53bab479631fdbfbd123b
[6]:
  https://github.com/Xunnamius/git-add-then-commit/commit/8cdeda3d460c41701895fc733b01382d77453d12
[7]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.7...v1.1.8
[8]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ae836eb4ab2b88700e0f22deb880049d779e79f4
[9]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.6...v1.1.7
[10]:
  https://github.com/Xunnamius/git-add-then-commit/commit/25667ac53116bddcfd22ca9befef34078148a9f6
[11]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.5...v1.1.6
[12]:
  https://github.com/Xunnamius/git-add-then-commit/commit/a4e209c1093b0eb07bbe82e7d3088fe74d55ff86
[13]:
  https://github.com/Xunnamius/git-add-then-commit/commit/db76562fac7f5db3dede61ffc223952bc8110f5f
[14]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.4...v1.1.5
[15]:
  https://github.com/Xunnamius/git-add-then-commit/commit/eb1dba93a66257fa06956d1f754d67f07a7267e3
[16]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.3...v1.1.4
[17]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6c4feeb715371890e3ef6b6f16c912c025470290
[18]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.2...v1.1.3
[19]:
  https://github.com/Xunnamius/git-add-then-commit/commit/870bbc20d74901bacba2b381e03357f5c1237ddf
[20]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.1...v1.1.2
[21]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3ec4273115289ab48b38b35a214d0e23b507a13e
[22]:
  https://github.com/Xunnamius/git-add-then-commit/commit/41cf8f7ec2bee7be9bdfa9d483678600daf2a27d
[23]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.0...v1.1.1
[24]:
  https://github.com/Xunnamius/git-add-then-commit/commit/228dd5dac079866cfae39baa1581c918bf29cfb1
[25]:
  https://github.com/Xunnamius/git-add-then-commit/commit/e3c34c05143a7fae1f1fd9d3f509b002f35b5886
[26]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3c8f8558c445e1ebbb5c9ca36cb83fc74df46895
[27]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.6...v1.1.0
[28]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6414981f96d88bee2230725a3e6a0c98dd84da77
[29]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d2394e515ab103d82f02cabb7e472ce42fcd299c
[30]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.5...v1.0.6
[31]:
  https://github.com/Xunnamius/git-add-then-commit/commit/063ece4205774b2b5a768cf34223dbd8ead72701
[32]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.4...v1.0.5
[33]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6b5020b7607758fce2f916bba2de5f5f05e416aa
[34]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.3...v1.0.4
[35]:
  https://github.com/Xunnamius/git-add-then-commit/commit/76e58c25acd362cedb3d7742dbdd248c6026c952
[36]:
  https://github.com/Xunnamius/git-add-then-commit/commit/22592a4742648394dc15e28d8767b376a9bbacba
[37]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.2...v1.0.3
[38]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec7083eab998634a7d85da2d669e332ceaa0c0c2
[39]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[40]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[41]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
[42]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[43]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[44]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[45]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[46]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[47]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[48]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[49]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[50]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[51]: https://conventionalcommits.org
[52]: https://semver.org
[53]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.9...v2.0.0
[54]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d50fcdbddf6cefba9b3b1bd488065aa1dbcf48ff
[55]:
  https://github.com/Xunnamius/git-add-then-commit/commit/7b9686df8fe732d007b02497071a5b5c3fb057dd
[56]:
  https://github.com/Xunnamius/git-add-then-commit/commit/e5d6dcdf56869382db0cabd9fd00abb841e0cc0c
[57]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d06de989ac44343a27c5b5e4a8cdf39be16ee96b
[58]:
  https://github.com/Xunnamius/git-add-then-commit/commit/072d37f832b751c4a13a90dc2ba9117a2c51e242
[59]:
  https://github.com/Xunnamius/git-add-then-commit/commit/93097b45f02ad3112b891a8a8d6b06327d31e4a3
[60]: https://github.com/Xunnamius/git-add-then-commit/issues/17
