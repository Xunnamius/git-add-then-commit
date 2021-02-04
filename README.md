<!-- prettier-ignore-start -->

<!-- badges-start -->

[![Black Lives Matter!][badge-blm]][link-blm]
[![Maintenance status][badge-maintenance]][link-repo]
[![Last commit timestamp][badge-last-commit]][link-repo]
[![Open issues][badge-issues]][link-issues]
[![Pull requests][badge-pulls]][link-pulls]
[![codecov][badge-codecov]][link-codecov]
[![Source license][badge-license]][link-license]
[![NPM version][badge-npm]][link-npm]
[![semantic-release][badge-semantic-release]][link-semantic-release]

<!-- badges-end -->

<!-- prettier-ignore-end -->

# git-add-then-commit

A minimalist CLI tool to automate the ↯ `git add X` ↯ `git commit -m 'Y(Z): W'`
↯ workflow, helping you compose [conventional commits][10] quickly and easily.

## Install

> Note: NPM versions >=7 may need `npm install --legacy-peer-deps` until
> [upstream peer dependency problems are resolved][npm-v7-bc].

```shell
npm install --global git-add-then-commit
```

<details><summary><strong>[additional details]</strong></summary>

> Note: **you probably don't need to read through this!** This information is
> primarily useful for those attempting to bundle this package or for people who
> have an opinion on ESM versus CJS.

This is a [dual CJS2/ES module][dual-module] package. That means this package
exposes both CJS2 and ESM entry points.

Loading this package via `require(...)` will cause Node and Webpack to use the
[CJS2 bundle][cjs2] entry point, disable [tree shaking][tree-shaking] in Webpack
4, and lead to larger bundles in Webpack 5. Alternatively, loading this package
via `import { ... } from ...` or `import(...)` will cause Node to use the ESM
entry point in [versions that support it][node-esm-support], as will Webpack.
Using the `import` syntax is the modern, preferred choice.

For backwards compatibility with Webpack 4 and Node versions < 14,
\[`package.json`]\[package-json] retains the [`module`][module-key] key, which
points to the ESM entry point, and the [`main`][exports-main-key] key, which
points to the CJS2 entry point explicitly (using the .js file extension). For
Webpack 5 and Node versions >= 14, \[`package.json`]\[package-json] includes the
[`exports`][exports-main-key] key, which points to both entry points explicitly.

Though \[`package.json`]\[package-json] includes
[`{ "type": "commonjs"}`][local-pkg], note that the ESM entry points are ES
module (`.mjs`) files. \[`package.json`]\[package-json] also includes the
[`sideEffects`][side-effects-key] key, which is `false` for [optimal tree
shaking][tree-shaking], and the `types` key, which points to a TypeScript
declarations file.

Additionally, this package does not maintain shared state and so does not
exhibit the [dual package hazard][hazard].

</details>

## Usage

> You can use `--help` to get help text output, `--version` to get the current
> version, and `--silent` to prevent all output.

For a project using [conventional commits][10], your commit flow might go
something like this:

```shell
git add path/to/file2
git commit -m 'feat(file2): commit message about file2'
```

Where the commit message has:

- Type: **feat**
- Scope: **file2**
- Description: **commit message about file2**

With `git-add-then-commit` (`gac`), this can be simplified to:

```shell
git add path/to/file2
gac feat file2 'commit message about file2'
```

And further simplified to:

```shell
gac path/to/file2 feat file2 'commit message about file2'
```

And even further (using a scope option):

```shell
gac path/to/file2 feat -- 'commit message about file2'
```

And further still:

```shell
gac path feat -- 'commit message about file2'
```

`--` (an alias of `--scope-basename`) is a **scope option** that causes `gac` to
use the _basename_ of 1) the first path passed to `gac` or 2) the first staged
path returned by `git status`. The basename is always lowercased.

If more than one file is staged and no paths are passed to `gac`, using
`--scope-basename` will cause an ambiguity error.

You can also use `-` (or: `--scope-omit`) to generate a commit message without a
scope:

```shell
gac path feat - 'commit message about file2'
```

Which is equivalent to:

```shell
git add path/to/file2
git commit -m 'feat: commit message about file2'
```

Further, `--scope-as-is` will use the first path passed to `gac` as the scope
_exactly as typed_:

```shell
gac path feat --scope-as-is 'commit message about file2'
```

Which is equivalent to:

```shell
git add path/to/file2
git commit -m 'feat(path): commit message about file2'
```

If no paths are passed to `gac`, using `--scope-as-is` will cause an ambiguity
error.

Finally, `--scope-full` will resolve the "full" or absolute path (relative to
the repository root) of the first path passed to `gac`:

```shell
gac path feat --scope-full 'commit message about file2'
```

Which is equivalent to:

```shell
git add path/to/file2
git commit -m 'feat(path/to/file2): commit message about file2'
```

If no path arguments are passed, `--scope-full` will return the full path if
there is exactly one staged file, the deepest common ancestor of all staged
files if there is more than one, or fail with an ambiguity error if there is no
non-root common ancestor. The path is always lowercased.

#### Other Details

- Use `gac --help` for more usage information, including other aliases
- The scope string argument must be omitted when specifying a scope option
- Specifying more than one scope option will cause an error
- Executing `gac` with no paths staged and no path arguments will cause an error

### Importing as a Module

This package can be imported and run directly in source without spawning a child
process or calling a CLI. This is useful for, for instance, composing multiple
[yargs][1]-based CLI tools together.

```typescript
import { configureProgram } from 'git-add-then-commit';

const { program, parse } = configureProgram();
// `program` is a yargs instance
// `parse` is an async function that will (eventually) call program.parse(...)
await parse(['path', 'type', '--no-scope', 'commit message here']);
```

## Documentation

Project documentation can be found under [`docs/`][docs].

## Contributing and Support

**[New issues][choose-new-issue] and [pull requests][pr-compare] are always
welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟 this
project][link-repo] to let me know you found it useful! ✊🏿 Thank you!

See [CONTRIBUTING.md][contributing] and [SUPPORT.md][support] for more
information.

[badge-blm]: https://api.ergodark.com/badges/blm 'Join the movement!'
[link-blm]: https://secure.actblue.com/donate/ms_blm_homepage_2019
[badge-maintenance]:
  https://img.shields.io/maintenance/active/2021
  'Is this package maintained?'
[link-repo]: https://github.com/xunnamius/git-add-then-commit
[badge-last-commit]:
  https://img.shields.io/github/last-commit/xunnamius/git-add-then-commit
  'When was the last commit to the official repo?'
[badge-issues]:
  https://isitmaintained.com/badge/open/Xunnamius/git-add-then-commit.svg
  'Number of known issues with this package'
[link-issues]: https://github.com/Xunnamius/git-add-then-commit/issues?q=
[badge-pulls]:
  https://img.shields.io/github/issues-pr/xunnamius/git-add-then-commit
  'Number of open pull requests'
[link-pulls]: https://github.com/xunnamius/git-add-then-commit/pulls
[badge-codecov]:
  https://codecov.io/gh/Xunnamius/git-add-then-commit/branch/main/graph/badge.svg?token=HWRIOBAAPW
  'Is this package well-tested?'
[link-codecov]: https://codecov.io/gh/Xunnamius/git-add-then-commit
[badge-license]:
  https://img.shields.io/npm/l/git-add-then-commit
  "This package's source license"
[link-license]:
  https://github.com/Xunnamius/git-add-then-commit/blob/main/LICENSE
[badge-npm]:
  https://api.ergodark.com/badges/npm-pkg-version/git-add-then-commit
  'Install this package using npm or yarn!'
[link-npm]: https://www.npmjs.com/package/git-add-then-commit
[badge-semantic-release]:
  https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
  'This repo practices continuous integration and deployment!'
[link-semantic-release]: https://github.com/semantic-release/semantic-release
[docs]: docs
[choose-new-issue]:
  https://github.com/Xunnamius/git-add-then-commit/issues/new/choose
[pr-compare]: https://github.com/Xunnamius/git-add-then-commit/compare
[contributing]: CONTRIBUTING.md
[support]: .github/SUPPORT.md
[cjs2]: https://webpack.js.org/configuration/output/#module-definition-systems
[dual-module]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#dual-commonjses-module-packages
[exports-main-key]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#package-entry-points
[hazard]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#dual-package-hazard
[local-pkg]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
[module-key]: https://webpack.js.org/guides/author-libraries/#final-steps
[node-esm-support]:
  https://medium.com/%40nodejs/node-js-version-14-available-now-8170d384567e#2368
[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[npm-v7-bc]:
  https://github.blog/2020-10-13-presenting-v7-0-0-of-the-npm-cli/#user-content-breaking-changes
[10]: https://conventionalcommits.org
[1]: https://github.com/yargs/yargs
