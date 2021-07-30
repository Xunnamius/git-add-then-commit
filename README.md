<!-- prettier-ignore-start -->

<!-- badges-start -->

[![Black Lives Matter!][badge-blm]][link-blm]
[![Maintenance status][badge-maintenance]][link-repo]
[![Last commit timestamp][badge-last-commit]][link-repo]
[![Open issues][badge-issues]][link-issues]
[![Pull requests][badge-pulls]][link-pulls]
[![Codecov][badge-codecov]][link-codecov]
[![Source license][badge-license]][link-license]
[![Tree shaking support][badge-tree-shaking]][link-bundlephobia]
[![Compressed package size][badge-size]][link-bundlephobia]
[![NPM version][badge-npm]][link-npm]
[![Uses Semantic Release!][badge-semantic-release]][link-semantic-release]

<!-- badges-end -->

<!-- prettier-ignore-end -->

# git-add-then-commit

A minimalist CLI tool to automate the ↯ `git add X` ↯ `git commit -m 'Y(Z): W'`
↯ workflow, helping you compose [conventional commits][10] quickly and easily.

## Install

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

For backwards compatibility with Webpack 4 (_compat with Webpack 4 is not
guaranteed!_) and Node versions < 14, [`package.json`][package-json] retains the
[`module`][module-key] key, which points to the ESM entry point, and the
[`main`][exports-main-key] key, which points to the CJS2 entry point explicitly
(using the .js file extension). For Webpack 5 and Node versions >= 14,
[`package.json`][package-json] includes the [`exports`][exports-main-key] key,
which points to both entry points explicitly.

Though [`package.json`][package-json] includes
[`{ "type": "commonjs"}`][local-pkg], note that the ESM entry points are ES
module (`.mjs`) files. [`package.json`][package-json] also includes the
[`sideEffects`][side-effects-key] key, which is `false` for [optimal tree
shaking][tree-shaking], and the `types` key, which points to a TypeScript
declarations file.

Additionally, this package does not maintain shared state and so does not
exhibit the [dual package hazard][hazard].

</details>

## Usage

    gac [path1, path2, ...] commit-type commit-scope commit-message

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
- Subject (or message): **commit message about file2**

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

### Scope Options

`--` as used in the example above is a _scope option_, which can be used in
place of `commit-scope`.

> _To maintain scope consistency in generated changelogs with little additional
> effort, I find myself using the [`--scope-root`][2] and [`--scope-omit`][3]
> scope options almost exclusively these days._ — [Xunn][4]

#### Basename

`--` (or: `--scope-basename`) will generate a commit message using the
_basename_ of 1) the first path passed to `gac` or 2) the first staged path
returned by `git status`. The basename is always lowercased.

If more than one file is staged and no paths are passed to `gac`, using
`--scope-basename` will cause an ambiguity error.

#### Omit

`-` (or: `--scope-omit`) will generate a commit message with no scope.

##### Example

```shell
gac path feat - 'commit message about file2'
```

Which is equivalent to:

```shell
git add path/to/file2
git commit -m 'feat: commit message about file2'
```

#### As-is

`-a` (or: `--scope-as-is`) will generate a commit message using the first path
passed to `gac` _exactly as it was typed_.

##### Example

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

#### Full

`-f` (or: `--scope-full`) will generate a commit message using the "full" or
absolute path (relative to the repository root) of the first path passed to
`gac`. The path is always lowercased.

##### Example

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
relative common ancestor.

#### Root

`---` (or: `--scope-root`) will generate a commit message with a more
"photogenic" scope. That is, commit messages derived using this option tend to
look nicer in [generated changelogs][5] (few in number, analogous to filesystem
structure, consistently applied across the lifetime of the project, short and
sweet, usually alphanumeric).

Like [`--scope-full`][6], `--scope-root` will resolve the "full" or absolute
path (relative to the repository root) of the first path passed to `gac`. Unlike
[`--scope-full`][6], only the name of the _first directory_ in the full
path—rather than the full path itself—will be used as the `commit-scope`.

If no path arguments are passed, `--scope-root` will return the first directory
in the full path if there is exactly one staged file. If there is more than one
staged file and their full paths share the same first directory (or "root"),
said directory is used. Otherwise, if there is no common first directory, the
operation fails with an ambiguity error. This is usually a hint to construct [a
more fine-grain commit][7], or to use [`--scope-omit`][3].

If the selected path has no first directory, i.e. it points to a file at the
root of the project, _the filename will be used as the `commit-scope` instead_,
sans its extension (see `package.json` in the example below).

Regardless, the selected path is always lowercased.

##### Example

```shell
gac path feat --- 'commit message about changes'
gac package.json package-lock.json chore --- 'update dependencies'
```

Which is equivalent to:

```shell
git add path/to/file2
git add path/file3
git add path/to/file4
git commit -m 'feat(path): commit message about changes'

git add package.json
git add package-lock.json
git commit -m 'chore(package): update dependencies'
```

### Tips

- Use `gac --help` for more usage information, including listing all aliases.
- Use `gac ... --no-verify` to perform an [unverified commit][8].
- Executing `gac` with no paths staged and no path arguments will cause an
  error.
- Specifying more than one scope option will cause an error.
- The scope string argument must be omitted when specifying a scope option.
- If `commit-message` describes a [breaking change][9], [an exclamation point
  will be prepended to the colon][11] in the final commit message.

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

Further documentation can be found under [`docs/`][docs].

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
[badge-size]: https://badgen.net/bundlephobia/minzip/git-add-then-commit
[badge-tree-shaking]:
  https://badgen.net/bundlephobia/tree-shaking/git-add-then-commit
  'Is this package optimized for Webpack?'
[link-bundlephobia]:
  https://bundlephobia.com/result?p=git-add-then-commit
  'Package size (minified and gzipped)'
[package-json]: package.json
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
[2]: #root
[3]: #omit
[4]: https://github.com/Xunnamius
[5]: https://github.com/conventional-changelog/conventional-changelog
[6]: #full
[7]: https://dev.to/cbillowes/why-i-create-atomic-commits-in-git-kfi
[8]:
  https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---no-verify
[9]:
  https://github.com/Xunnamius/conventional-changelog-projector/blob/bde3ed43fd30aae4657c5b27f9e14a20115a903d/defaults.js#L124
[11]:
  https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with--to-draw-attention-to-breaking-change
