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
↯ workflow and help you compose [atomic][7] [consistent][2] [conventional
commits][10] quickly and easily.

## Install

```bash
npm install --global git-add-then-commit
```

## Usage

```bash
gac [path1, path2, ...] commit-type commit-scope commit-message
```

> You can use `--help` to get help text output, `--version` to get the current
> version, and `--silent` to prevent all output.

For a repository using [conventional commits][10], your commit flow might go
something like this:

```bash
git add path/to/file2
git commit -m 'feat(file2): add new killer feature'
```

Where the commit message has:

- Type: **feat**
- Scope: **file2**
- Subject (or message): **add new killer feature**

With `git-add-then-commit` (`gac`), this can be simplified to:

```bash
git add path/to/file2
gac feat file2 'add new killer feature'
```

And further simplified to:

```bash
gac path/to/file2 feat file2 'add new killer feature'
```

And even further (using a scope option):

```bash
gac path/to/file2 feat -- 'add new killer feature'
```

And further still:

```bash
gac path feat -- 'add new killer feature'
```

### Scope Options

`--` as used in the example above is a _scope option_, which can be used in
place of `commit-scope`.

> To maintain scope consistency in generated changelogs with minimal effort,
> favor the [`--scope-root`][2] and [`--scope-omit`][3] scope options.

#### Basename

`--` (or: `--scope-basename`) will generate a commit message using the
lowercased _basename_ of 1) the first path passed to `gac` or 2) the first
staged path returned by `git status`. The basename is always lowercased.

If more than one file is staged and no paths are passed to `gac`, using
`--scope-basename` will cause an ambiguity error.

#### Omit

`-` (or: `--scope-omit`) will generate a commit message with no scope.

##### Example

Given the following filesystem structure:

    .
    └── src
        └── index.ts <MODIFIED>

The following are equivalent:

```bash
gac src feat - 'add new killer feature'

git add src/index.ts
git commit -m 'feat: add new killer feature'
```

#### As-is

`-a` (or: `--scope-as-is`) will generate a commit message using the first path
passed to `gac` [_exactly as typed_][12].

If no paths are passed to `gac`, using `--scope-as-is` will cause an ambiguity
error.

##### Example

Given the following filesystem structure:

    .
    └── src
        ├── iNdex.ts <MODIFIED>
        ├── cli.ts <MODIFIED>
        ├── errors.ts <MODIFIED>
        └── git.ts <MODIFIED>

The following are equivalent:

```bash
gac src/iNdex.ts src feat --scope-as-is 'add new killer feature'

git add src/iNdex.ts
git add src/cli.ts
git add src/errors.ts
git add src/git.ts
git commit -m 'feat(src/iNdex.ts): add new killer feature'
```

#### Full

`-f` (or: `--scope-full`) will generate a commit message using the "full" or
absolute path (relative to the repository root) of the first path passed to
`gac`.

If no path arguments are passed, `--scope-full` will use the full path—including
filename and extension—if there is exactly one path or staged file, the deepest
common ancestor of all paths/files if there is more than one (or the first path
is ambiguous), or fail with an ambiguity error if there is no relative common
ancestor.

Regardless, the final `commit-scope` is always lowercased.

##### Example

Given the following filesystem structure:

    .
    ├── public
    │   └── images
    │       ├── favicon.ico <MODIFIED>
    │       ├── hero.png
    │       └── villain.png
    ├── src
    │   ├── index.ts <MODIFIED>
    │   └── interface
    │       ├── cli.ts <MODIFIED>
    │       └── git.ts
    └── test
        ├── units.ts
        └── fixtures
            ├── dummy-1.ts <MODIFIED>
            └── dummy-2.ts <MODIFIED>

The following are equivalent:

```bash
gac src feat --scope-full 'add new killer feature'

git add src/index.ts
git add src/interface/cli.ts
git commit -m 'feat(src): add new killer feature'
```

```bash
gac test refactor --scope-full 'update tests for new feature'

git add test/fixtures/dummy-1.ts
git add test/fixtures/dummy-2.ts
git commit -m 'refactor(test/fixtures): update tests for new feature'
```

```bash
gac public style --scope-full 'new favicon'

git add public
git commit -m 'style(public/images/favicon.ico): new favicon'
```

#### Root

`---` (or: `--scope-root`) will generate a commit message with a more
"photogenic" scope. That is, commit messages derived using this option tend to
look nicer in [generated changelogs][5]. Specifically:

- A small, consistently derived set of scopes are used across the lifetime of
  the repository.
- Derived scopes are analogous to filesystem structure.
- Derived scopes tend to be short, sweet, and mostly alphanumeric.

Like [`--scope-full`][6], `--scope-root` will derive `commit-scope` by selecting
from any path arguments and staged file paths available. Unlike
[`--scope-full`][6], only the _first directory_ (left-to-right) in the selected
path—rather than the deepest common ancestor—is used to derive `commit-scope`.

> For example, `path` in `path/to/some/file` is the first directory.

If no path arguments are passed and there is exactly one staged file,
`--scope-root` will select the first directory from that file's path. If there
is more than one staged file (or the first path is ambiguous) and their paths
share the same first directory, said directory is selected; if there is no
common first directory, the operation fails with an ambiguity error.

> An ambiguity error using `--scope-root` is usually a hint to construct [a more
> fine-grain commit][7].

If the selected path has no first directory, i.e. it points to a file at the
root of the repository, the filename is used as `commit-scope` instead with its
file extension removed (see `package.json` in the examples below).

On the other hand, if the selected path has a first directory matching
`commit-type` (see `test` in the examples below):

- If there is a _second directory_ in the selected path, the second directory is
  used to derive the `commit-scope` instead.

> For example, `to` in `path/to/some/file` is the second directory.

- If there is no second directory, the filename (sans extension) is used to
  derive the `commit-scope` _only if the file is not named "index"_.

- If there is no second directory and the file _is_ named "index" (sans
  extension), `commit-scope` is [omitted][3].

At the end of the process, if it has not already been omitted, `commit-scope` is
lowercased and [split][15] on `"."` with the first element used as the final
`commit-scope`. Finally, if `commit-scope` matches `commit-type`, `commit-scope`
is [omitted][3].

##### Example

Given the following filesystem structure:

    .
    ├── CHANGELOG.md <MODIFIED>
    ├── CONTRIBUTING.md
    ├── docs
    │   ├── supplementary.md <MODIFIED>
    │   └── README.md <MODIFIED>
    ├── external-scripts
    │   └── my-script.ts <MODIFIED>
    ├── index.ts <MODIFIED>
    ├── lib
    │   ├── api
    │   │   └── adapter.ts <MODIFIED>
    │   ├── index.ts <MODIFIED>
    │   ├── cli.ts <MODIFIED>
    │   └── git.ts
    ├── package-lock.json <MODIFIED>
    ├── package.json <MODIFIED>
    ├── README.md
    └── test
        ├── index.ts <MODIFIED>
        ├── integrations
        │   ├── browser-tests.ts
        │   ├── e2e-tests.ts <MODIFIED>
        │   └── index.ts <MODIFIED>
        └── units.ts <MODIFIED>

The following are equivalent:

```bash
gac lib/index.ts fix --- 'fix bug that caused crash'

git add lib/index.ts
git commit -m 'fix(lib): fix bug that caused crash'
```

```bash
gac lib/api refactor --- 'use updated mongodb native driver'

git add lib/api/adapter.ts
git commit -m 'refactor(lib): use updated mongodb native driver'
```

```bash
gac package.json package-lock.json chore --- 'update dependencies'

git add package.json
git add package-lock.json
git commit -m 'chore(package): update dependencies'
```

```bash
git add docs
gac docs --- 'add sections on new killer feature'
# one-liner: gac docs docs --- 'add sections on new killer feature'

git add docs
git commit -m 'docs: add sections on new killer feature'
```

```bash
gac test/integrations/index.ts test --- 'update integration tests'

git add test/integrations/index.ts
git commit -m 'test(integrations): update integration tests'
```

```bash
gac test/integrations style --- 'use emojis in all TODO comments'

git add test/integrations/e2e-tests.ts
git commit -m 'style(test): use emojis in all TODO comments'
```

```bash
gac test/index.ts test --- 'update tooling to use latest features'

git add test/index.ts
git commit -m 'test: update tooling to use latest features'
```

```bash
gac test test --- 'add unit tests for new killer feature'

git add test/units.ts
git commit -m 'test(units): add unit tests for new killer feature'
```

```bash
gac index.ts lib/cli.ts feat --- 'add new killer feature'

git add index.ts
git add lib/cli.ts
git commit -m 'feat(index): add new killer feature'
```

```bash
gac CHANGELOG.md docs --- 'regenerate'

git add CHANGELOG.md
git commit -m 'docs(changelog): regenerate'
```

```bash
gac external-scripts/my-script.ts build --- 'update my-script functionality'

git add external-scripts/my-script.ts
git commit -m 'build(externals/my-script): update my-script functionality'
```

### Monorepo Pseudo-Pathspecs

Given the following filesystem structure:

    .
    ├── CHANGELOG.md
    ├── CONTRIBUTING.md
    ├── package-lock.json
    ├── package.json
    ├── packages
    │   ├── pkg-1
    │   │   └── specific
    │   │       └── script.ts <MODIFIED>
    │   └── pkg-2
    │       └── src
    │           └── index.ts <MODIFIED>
    └── README.md

The following are equivalent (`::` is a so-called "pseudo-[pathspec][16]"):

```bash
gac ::pkg-2 style --- 'cosmetic changes'

git add packages/pkg-2/src/index.ts
git commit -m 'style(packages/pkg-2): cosmetic changes'
```

```bash
gac ::pkg-1/specific/script.ts feat --- 'added something specific to a script'

git add packages/pkg-1/specific/script.ts
git commit -m 'feat(packages/pkg-1): added something specific to a script'
```

```bash
cd packages/pkg-2
gac ::pkg-1 feat --- 'added something specific to a script'

git add ../../packages/pkg-1/specific/script.ts
git commit -m 'feat(packages/pkg-1): added something specific to a script'
```

### Other Features

- Use `--help` for more usage information, including listing all aliases.

- Use `--no-verify` to perform an [unverified commit][8].

- Use `--verify=simple` to set `GAC_VERIFY_SIMPLE=true` in the runtime
  environment, which can be used to skip certain tests based on the presence of
  the variable.

- If `commit-message` describes a [breaking change][9], [an exclamation point is
  prepended to the colon][11] in the final commit message.

- `gac` works with both currently staged files and any paths passed as arguments
  with the latter having precedence. This makes it easy to, for instance, stage
  files with [vscode][13] or [`git add -p`][14] then use `gac` to quickly
  compose an [atomic][7] [conventional commit][10].

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

> Further documentation can be found under [`docs/`][docs].

This is a [dual CJS2/ES module][dual-module] package. That means this package
exposes both CJS2 and ESM (treeshakable and non-treeshakable) entry points.

Loading this package via `require(...)` will cause Node and some bundlers to use
the [CJS2 bundle][cjs2] entry point. This can reduce the efficacy of [tree
shaking][tree-shaking]. Alternatively, loading this package via
`import { ... } from ...` or `import(...)` will cause Node (and other JS
runtimes) to use the non-treeshakable ESM entry point in [versions that support
it][node-esm-support]. Modern bundlers like Webpack and Rollup will use the
treeshakable ESM entry point. Hence, using the `import` syntax is the modern,
preferred choice.

For backwards compatibility with Node versions < 14,
[`package.json`][package-json] retains the [`main`][exports-main-key] key, which
points to the CJS2 entry point explicitly (using the .js file extension). For
Node versions > 14, [`package.json`][package-json] includes the more modern
[`exports`][exports-main-key] key. For bundlers, [`package.json`][package-json]
includes the bundler-specific [`module`][module-key] key (eventually superseded
by [`exports['.'].module`][exports-module-key]), which points to ESM source
loosely compiled specifically to support [tree shaking][tree-shaking].

Though [`package.json`][package-json] includes
[`{ "type": "commonjs"}`][local-pkg], note that the ESM entry points are ES
module (`.mjs`) files. [`package.json`][package-json] also includes the
[`sideEffects`][side-effects-key] key, which is `false` for [optimal tree
shaking][tree-shaking], and the `types` key, which points to a TypeScript
declarations file.

Additionally, this package does not maintain shared state and so does not
exhibit the [dual package hazard][hazard].

### License

[![FOSSA analysis][badge-fossa]][link-fossa]

## Contributing and Support

**[New issues][choose-new-issue] and [pull requests][pr-compare] are always
welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟 this
project][link-repo] to let me know you found it useful! ✊🏿 Thank you!

See [CONTRIBUTING.md][contributing] and [SUPPORT.md][support] for more
information.

[badge-blm]: https://api.ergodark.com/badges/blm 'Join the movement!'
[link-blm]: https://secure.actblue.com/donate/ms_blm_homepage_2019
[badge-maintenance]:
  https://img.shields.io/maintenance/active/2022
  'Is this package maintained?'
[link-repo]: https://github.com/xunnamius/git-add-then-commit
[badge-last-commit]:
  https://img.shields.io/github/last-commit/xunnamius/git-add-then-commit
  'When was the last commit to the official repo?'
[badge-issues]:
  https://img.shields.io/github/issues/Xunnamius/git-add-then-commit
  'Open issues'
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
[badge-fossa]:
  https://app.fossa.com/api/projects/git%2Bgithub.com%2FXunnamius%2Fgit-add-then-commit.svg?type=large
  "Analysis of this package's license obligations"
[link-fossa]:
  https://app.fossa.com/projects/git%2Bgithub.com%2FXunnamius%2Fgit-add-then-commit
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
[module-key]:
  https://github.com/nodejs/node-eps/blob/4217dca299d89c8c18ac44c878b5fe9581974ef3/002-es6-modules.md#51-determining-if-source-is-an-es-module
[exports-module-key]:
  https://webpack.js.org/guides/package-exports/#providing-commonjs-and-esm-version-stateless
[node-esm-support]:
  https://medium.com/%40nodejs/node-js-version-14-available-now-8170d384567e#2368
[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[10]: https://conventionalcommits.org
[1]: https://github.com/yargs/yargs
[2]: #root
[3]: #omit
[5]: https://github.com/conventional-changelog/conventional-changelog
[6]: #full
[7]: https://dev.to/cbillowes/why-i-create-atomic-commits-in-git-kfi
[8]:
  https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---no-verify
[9]:
  https://github.com/Xunnamius/conventional-changelog-projector/blob/bde3ed43fd30aae4657c5b27f9e14a20115a903d/defaults.js#L124
[11]:
  https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with--to-draw-attention-to-breaking-change
[12]: https://en.wikipedia.org/wiki/WYSIWYG
[13]: https://code.visualstudio.com/docs/editor/versioncontrol#_commit
[14]:
  https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging#_staging_patches
[15]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
[16]:
  https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefpathspecapathspec
