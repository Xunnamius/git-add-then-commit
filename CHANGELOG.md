# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][97]; this project adheres to
[Semantic Versioning][98].

### [2.2.4][99] (2022-01-03)

#### ⚙️ Build system

- **babel:** use modern transform-default-named-imports settings
  ([567fa88][100])
- **readme:** update shields.io maintenance badge to 2022 ([821ec2b][101])

### [2.2.3][1] (2021-11-16)

#### 🪄 Fixes

- Ship missing bundle and esm distributables ([2f5a7bf][2])

### [2.2.2][3] (2021-11-16)

#### ⚙️ Build system

- **package:** re-enable treeshaking in webpack ([4a4c29d][4])

### [2.2.1][5] (2021-11-10)

#### ⚙️ Build system

- **package:** re-enable windows support ([4dcdc2e][6])

## [2.2.0][7] (2021-11-08)

#### ✨ Features

- Pseudo-pathspec support for learna-style monorepo packages ([d5d232f][8])
- Recognize new "simple" verification mode flag, other verification flags
  ([c51fd83][9])

#### ⚙️ Build system

- Add back nullish coalescing operator babel transform for older node versions
  ([ec990c4][10])
- **package:** backport npm script fixes ([003564f][11])
- **package:** limit os to non-Windows machines ([7459172][12])

### [2.1.3][13] (2021-08-29)

#### ⚙️ Build system

- **license:** switch to MIT license ([1b9c5f5][14])

### [2.1.2][15] (2021-08-26)

#### 🪄 Fixes

- Scope-root now splits commit-scope on "." ([7f9f4cd][16])

### [2.1.1][17] (2021-08-05)

#### 🪄 Fixes

- Scope-root handles first/second directories, index files as described
  ([5854d08][18])

## [2.1.0][19] (2021-07-31)

#### ✨ Features

- **src:** add --no-verify support ([9e1e803][20])
- **src:** add --scope-root scope option support ([19512db][21])
- **src:** add exclamation-colon support for breaking changes ([4338570][22])

#### 🪄 Fixes

- Update usage for latest yargs ([f9c0393][23])

#### ⚙️ Build system

- **.github/workflows:** remove old workflows ([0f62a7a][24])
- **babel.config.js:** fix add-import-extension surprise breaking change
  ([68a8197][25])
- **webpack.config.js:** show most critical dependency warnings in webpack
  ([6f5f082][26])

### [2.0.5][27] (2021-06-27)

#### ⚙️ Build system

- **package.json:** security updates ([7b91553][28])
- Switch to @xunnamius/conventional-changelog-projector shared config
  ([2fad2b6][29])

### [2.0.4][30] (2021-03-14)

#### ⚙️ Build system

- **deps:** bump simple-git from 2.36.1 to 2.36.2 ([c34d4b5][31])

#### 🔥 Reverted

- _"debug(build-test-deploy.yml): workaround for GH API token issue"_
  ([bf9e348][32])

### [2.0.3][33] (2021-03-08)

#### ⚙️ Build system

- **deps:** bump simple-git from 2.36.0 to 2.36.1 ([0c4897b][34])

### [2.0.2][35] (2021-03-04)

#### ⚙️ Build system

- **deps:** bump simple-git from 2.35.2 to 2.36.0 ([9d3cb79][36])

### [2.0.1][37] (2021-02-24)

#### ⚙️ Build system

- **deps:** bump simple-git from 2.35.1 to 2.35.2 ([90c7837][38])

## [2.0.0][39] (2021-02-24)

### 💥 BREAKING CHANGES 💥

- **_index.ts_:** **attempting to add a path that is already staged will now**
  result in an error unless --force is used. This is to prevent clobbering the
  git index accidentally after running operations like `git add -p`

#### ✨ Features

- **index.ts:** add pre-add check to prevent clobbering the index
  ([93097b4][40]) <sup>closes [#17][41]</sup>

#### ⚙️ Build system

- **integration-client.test.ts:** add integration test for new behavior
  ([d50fcdb][42])
- **integration-client.test.ts:** use the force ([7b9686d][43])
- **unit-index.test.ts:** 100% unit test coverage ([e5d6dcd][44])
- **unit-index.test.ts:** fix bug in test fixture ([d06de98][45])
- **unit-index.test.ts:** make tests consistent with new functionality
  ([072d37f][46])

### [1.1.9][47] (2021-02-23)

#### 🪄 Fixes

- Import fixes from cli lens ([27901cd][48])
- **integration-client.test.ts:** add force:true to del operation
  ([6b698d0][49])

#### ⚙️ Build system

- **package.json:** bump jest timeout to 1 minute ([4c37f00][50])
- **package.json:** update dependencies ([8f59af8][51])
- Rename env-expect to expect-env ([8cdeda3][52])

### [1.1.8][53] (2021-02-11)

#### ⚙️ Build system

- Test-integration-node-cli => test-integration-client ([ae836eb][54])

### [1.1.7][55] (2021-02-11)

#### ⚙️ Build system

- **package.json:** update to proper forked dependencies ([25667ac][56])

### [1.1.6][57] (2021-02-10)

#### ⚙️ Build system

- **webpack.config.js:** normalize webpack configuration across repos
  ([a4e209c][58])
- **webpack.config.js:** remove ES6 syntax from JS file ([db76562][59])

### [1.1.5][60] (2021-02-10)

#### ⚙️ Build system

- **package.json:** update dependencies ([eb1dba9][61])

### [1.1.4][62] (2021-02-08)

#### ⚙️ Build system

- **deps:** bump simple-git from 2.32.0 to 2.34.2 ([6c4feeb][63])

### [1.1.3][64] (2021-02-05)

#### ⚙️ Build system

- **deps:** bump simple-git from 2.31.0 to 2.32.0 ([870bbc2][65])

### [1.1.2][66] (2021-02-04)

#### 🪄 Fixes

- Ensure derived scopes are lowercased ([3ec4273][67])

#### ⚙️ Build system

- **package.json:** update deps ([41cf8f7][68])

### [1.1.1][69] (2021-01-31)

#### 🪄 Fixes

- Better error message handling and testing ([e3c34c0][70])
- **git-lib.ts:** fix bug where incorrect staged paths were returned
  ([228dd5d][71])

#### ⚙️ Build system

- **webpack.config.js:** externalize json imports ([3c8f855][72])

## [1.1.0][73] (2021-01-30)

#### ✨ Features

- Update to new internal implementations; fix several bugs ([d2394e5][74])

#### ⚙️ Build system

- **babel.config.js:** update to transform-default-named-imports plugin
  ([6414981][75])

### [1.0.6][76] (2021-01-29)

#### 🪄 Fixes

- **index.ts:** ensure yargs parses arguments before cwd check ([063ece4][77])

### [1.0.5][78] (2021-01-29)

#### 🪄 Fixes

- **post-release-check.yml:** use correct job name ([6b5020b][79])

### [1.0.4][80] (2021-01-29)

#### 🪄 Fixes

- **index.ts:** add more helpful error messages ([76e58c2][81])
- **post-release-check.yml:** ensure check-compat depends on sleeper job
  ([22592a4][82])

### [1.0.3][83] (2021-01-29)

#### ⚙️ Build system

- **post-release-check.yml:** add five minute wait for npm updates
  ([ec7083e][84])

### [1.0.2][85] (2021-01-29)

#### 🪄 Fixes

- **package.json:** fix dependency classifications ([8835260][86])

#### ⚙️ Build system

- **post-release-check.yml:** ensure packages are downloaded w/ --production
  ([1562bbc][87])

### [1.0.1][88] (2021-01-29)

#### ⚙️ Build system

- **post-release-check.yml:** run executables as part of check ([6151b24][89])

## [1.0.0][90] (2021-01-29)

#### ✨ Features

- Initial commit ([1e08a88][91])
- Upgrade to semantic-release-based pipeline ([3074894][92])

#### ⚙️ Build system

- **build-test-deploy.yml:** drop support for webpack 4 ([66d531e][93])
- **cleanup.yml:** fix bug for new package repos ([0792f9a][94])
- **integration-node-cli.test.ts:** add proper git config ([3947d23][95])
- **package.json:** add @types/yargs explicitly ([1183c65][96])

[1]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.2.2...v2.2.3
[2]:
  https://github.com/Xunnamius/git-add-then-commit/commit/2f5a7bf320632c8d82da667f3aaaf5832497c089
[3]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.2.1...v2.2.2
[4]:
  https://github.com/Xunnamius/git-add-then-commit/commit/4a4c29d55d47951ab7fd88544805de31150da661
[5]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.2.0...v2.2.1
[6]:
  https://github.com/Xunnamius/git-add-then-commit/commit/4dcdc2e4078a255a11927f25a6fb5265f39fac9d
[7]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.1.3...v2.2.0
[8]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d5d232f236c780adddaad00999ed5f7e3ef5534f
[9]:
  https://github.com/Xunnamius/git-add-then-commit/commit/c51fd833e7a072444e37ff38b7d6ce8693d1217c
[10]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec990c402a597a33d5294d47de67ca25f6d74435
[11]:
  https://github.com/Xunnamius/git-add-then-commit/commit/003564f17c82ec1590c53aa4a274ccd12e16ad0a
[12]:
  https://github.com/Xunnamius/git-add-then-commit/commit/7459172c36beba6ed3308e8098e0d7aa56823ffa
[13]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.1.2...v2.1.3
[14]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1b9c5f575a9f16aef6a64dcb12be8deafc642d44
[15]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.1.1...v2.1.2
[16]:
  https://github.com/Xunnamius/git-add-then-commit/commit/7f9f4cd464771ef52cc8319b976017abbee486eb
[17]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.1.0...v2.1.1
[18]:
  https://github.com/Xunnamius/git-add-then-commit/commit/5854d0840defbae8c4a6a6e00a5634103ee92c32
[19]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.0.5...v2.1.0
[20]:
  https://github.com/Xunnamius/git-add-then-commit/commit/9e1e803087757de27489dd091eb3e70f26835a62
[21]:
  https://github.com/Xunnamius/git-add-then-commit/commit/19512db70b577ae9ee03a3eddf1e59d891d30aee
[22]:
  https://github.com/Xunnamius/git-add-then-commit/commit/43385707664ce8c3fb692b994a75a0395f07b737
[23]:
  https://github.com/Xunnamius/git-add-then-commit/commit/f9c039385a4089e1ecee87685f53923bab89a97b
[24]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0f62a7a04ac3efaf594e06c6f9de17854f5513f7
[25]:
  https://github.com/Xunnamius/git-add-then-commit/commit/68a8197a55efa97bdfe449bc5a20a7ca04c12fa3
[26]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6f5f082b40801cb85567d8f7eed3babf1da81395
[27]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.0.4...v2.0.5
[28]:
  https://github.com/Xunnamius/git-add-then-commit/commit/7b91553f5b94e7e8b337579c0d256b3f3fd6557f
[29]:
  https://github.com/Xunnamius/git-add-then-commit/commit/2fad2b691e972c517ec1a2c0b7b969314483f658
[30]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.0.3...v2.0.4
[31]:
  https://github.com/Xunnamius/git-add-then-commit/commit/c34d4b550e24d37552295c68f1a99d7e640e9238
[32]:
  https://github.com/Xunnamius/git-add-then-commit/commit/bf9e3483a2b5e5aeed64185ed7e00c60490e8e10
[33]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.0.2...v2.0.3
[34]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0c4897bdc94bc8370e21c1f24fdc0243d36f561b
[35]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.0.1...v2.0.2
[36]:
  https://github.com/Xunnamius/git-add-then-commit/commit/9d3cb79c0124c5f2909bae0b88016e9980e73702
[37]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.0.0...v2.0.1
[38]:
  https://github.com/Xunnamius/git-add-then-commit/commit/90c7837bae66250b0d1807316536a4f787a68d47
[39]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.9...v2.0.0
[40]:
  https://github.com/Xunnamius/git-add-then-commit/commit/93097b45f02ad3112b891a8a8d6b06327d31e4a3
[41]: https://github.com/Xunnamius/git-add-then-commit/issues/17
[42]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d50fcdbddf6cefba9b3b1bd488065aa1dbcf48ff
[43]:
  https://github.com/Xunnamius/git-add-then-commit/commit/7b9686df8fe732d007b02497071a5b5c3fb057dd
[44]:
  https://github.com/Xunnamius/git-add-then-commit/commit/e5d6dcdf56869382db0cabd9fd00abb841e0cc0c
[45]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d06de989ac44343a27c5b5e4a8cdf39be16ee96b
[46]:
  https://github.com/Xunnamius/git-add-then-commit/commit/072d37f832b751c4a13a90dc2ba9117a2c51e242
[47]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.8...v1.1.9
[48]:
  https://github.com/Xunnamius/git-add-then-commit/commit/27901cdb658a7077638445c7a35bb29aec7d5f0a
[49]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6b698d02e6eaf71d3d3f61935763da0d97ebb065
[50]:
  https://github.com/Xunnamius/git-add-then-commit/commit/4c37f00927add15ee8c41f7342639bc84bf09bd0
[51]:
  https://github.com/Xunnamius/git-add-then-commit/commit/8f59af828f4fdbcdf7e53bab479631fdbfbd123b
[52]:
  https://github.com/Xunnamius/git-add-then-commit/commit/8cdeda3d460c41701895fc733b01382d77453d12
[53]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.7...v1.1.8
[54]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ae836eb4ab2b88700e0f22deb880049d779e79f4
[55]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.6...v1.1.7
[56]:
  https://github.com/Xunnamius/git-add-then-commit/commit/25667ac53116bddcfd22ca9befef34078148a9f6
[57]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.5...v1.1.6
[58]:
  https://github.com/Xunnamius/git-add-then-commit/commit/a4e209c1093b0eb07bbe82e7d3088fe74d55ff86
[59]:
  https://github.com/Xunnamius/git-add-then-commit/commit/db76562fac7f5db3dede61ffc223952bc8110f5f
[60]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.4...v1.1.5
[61]:
  https://github.com/Xunnamius/git-add-then-commit/commit/eb1dba93a66257fa06956d1f754d67f07a7267e3
[62]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.3...v1.1.4
[63]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6c4feeb715371890e3ef6b6f16c912c025470290
[64]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.2...v1.1.3
[65]:
  https://github.com/Xunnamius/git-add-then-commit/commit/870bbc20d74901bacba2b381e03357f5c1237ddf
[66]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.1...v1.1.2
[67]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3ec4273115289ab48b38b35a214d0e23b507a13e
[68]:
  https://github.com/Xunnamius/git-add-then-commit/commit/41cf8f7ec2bee7be9bdfa9d483678600daf2a27d
[69]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.1.0...v1.1.1
[70]:
  https://github.com/Xunnamius/git-add-then-commit/commit/e3c34c05143a7fae1f1fd9d3f509b002f35b5886
[71]:
  https://github.com/Xunnamius/git-add-then-commit/commit/228dd5dac079866cfae39baa1581c918bf29cfb1
[72]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3c8f8558c445e1ebbb5c9ca36cb83fc74df46895
[73]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.6...v1.1.0
[74]:
  https://github.com/Xunnamius/git-add-then-commit/commit/d2394e515ab103d82f02cabb7e472ce42fcd299c
[75]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6414981f96d88bee2230725a3e6a0c98dd84da77
[76]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.5...v1.0.6
[77]:
  https://github.com/Xunnamius/git-add-then-commit/commit/063ece4205774b2b5a768cf34223dbd8ead72701
[78]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.4...v1.0.5
[79]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6b5020b7607758fce2f916bba2de5f5f05e416aa
[80]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.3...v1.0.4
[81]:
  https://github.com/Xunnamius/git-add-then-commit/commit/76e58c25acd362cedb3d7742dbdd248c6026c952
[82]:
  https://github.com/Xunnamius/git-add-then-commit/commit/22592a4742648394dc15e28d8767b376a9bbacba
[83]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.2...v1.0.3
[84]:
  https://github.com/Xunnamius/git-add-then-commit/commit/ec7083eab998634a7d85da2d669e332ceaa0c0c2
[85]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.1...v1.0.2
[86]:
  https://github.com/Xunnamius/git-add-then-commit/commit/88352606b5b11b50da45b91eb521abbe0619d6ba
[87]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1562bbc9cf6d921907128ea61988d3a19b1d853f
[88]: https://github.com/Xunnamius/git-add-then-commit/compare/v1.0.0...v1.0.1
[89]:
  https://github.com/Xunnamius/git-add-then-commit/commit/6151b2452394e6c8bd9dee9c0c53706edeb6ce77
[90]:
  https://github.com/Xunnamius/git-add-then-commit/compare/1e08a889343fac542b4196a2d0b77fc7feb26a50...v1.0.0
[91]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1e08a889343fac542b4196a2d0b77fc7feb26a50
[92]:
  https://github.com/Xunnamius/git-add-then-commit/commit/307489496f94132a1d074374e6dc4d1bc57b0df6
[93]:
  https://github.com/Xunnamius/git-add-then-commit/commit/66d531e72db3cc2978fef77d643bd9c000101728
[94]:
  https://github.com/Xunnamius/git-add-then-commit/commit/0792f9a4e62cf816840fc67a53848bdc8e97a9c3
[95]:
  https://github.com/Xunnamius/git-add-then-commit/commit/3947d237b2562b8a78b06a98bc6e6d417356dc20
[96]:
  https://github.com/Xunnamius/git-add-then-commit/commit/1183c65a74fed20b2a7e71cbbd5f8577f7ec8b27
[97]: https://conventionalcommits.org
[98]: https://semver.org
[99]: https://github.com/Xunnamius/git-add-then-commit/compare/v2.2.3...v2.2.4
[100]:
  https://github.com/Xunnamius/git-add-then-commit/commit/567fa8832051c8942b1e01e623f42afe8b2748aa
[101]:
  https://github.com/Xunnamius/git-add-then-commit/commit/821ec2bdddd34edf3f44f3c1a94329866eda5060
