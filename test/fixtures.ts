export type Path = { [K in keyof typeof Paths]: string };
export type PathActual = string[] & { actual: string[] };

// ? The paths as they might appear in the command `git add paths`
const Paths = {
  single: ['file1'] as PathActual,
  short: ['path'] as PathActual,
  full: ['path/to/file2'] as PathActual,
  double: ['path', 'file1'] as PathActual,
  empty: ([] as unknown) as PathActual
};

// ? Actual paths as they would exist on a filesystem
Paths.single.actual = Paths.single;
Paths.short.actual = Paths.full;
Paths.full.actual = Paths.full;
Paths.double.actual = ['path/to/file2', 'file1'];
Paths.empty.actual = Paths.empty;

// ? An object of options corresponding to specific CLI arguments
const OptionsMeta: { [key: string]: { scope: Path; args: Record<string, unknown> } } = {
  // ? Each entry represents what scope should appear in the commit msg given
  // ? the makeCommit option is one of these keys:
  scopeOmit: {
    // ? The `scope` key defines the scope that should be used for the given
    // ? preset (key) or '' if no scope should be used
    scope: {
      single: '',
      short: '',
      full: '',
      double: '',
      empty: '' // ! Only meaningful w/ pre_stage=double (see comment XXX below)
    },
    // ? This represents the options arg passed directly to makeCommit
    args: { scopeOmit: true }
  },
  scopeAsIs: {
    scope: {
      single: 'file1',
      short: 'path',
      full: 'path/to/file2',
      double: 'path',
      empty: 'path/to/file2'
    },
    args: { scopeAsIs: true }
  },
  scopeBasename: {
    scope: {
      single: 'file1',
      short: 'file2',
      full: 'file2',
      double: 'file2',
      empty: 'file2'
    },
    args: { scopeBasename: true }
  },
  scopeFull: {
    scope: {
      single: 'file1',
      short: 'path/to/file2',
      full: 'path/to/file2',
      double: 'path/to/file2',
      empty: 'path/to/file2'
    },
    args: { scopeFull: true }
  },
  testScope: {
    scope: {
      single: 'scope',
      short: 'scope',
      full: 'scope',
      double: 'scope',
      empty: 'scope'
    },
    args: {}
  }
};

// ? An array of the path "preset" keys listed above
const addPathsKeys = Object.keys(Paths) as (keyof typeof Paths)[];

// ? Paths that are assumed staged by git before running the test
// ! XXX: Changing this requires changing the `empty` keys in the commit object
// ! XXX: into properly mapped objects (rather than simple strings)
const preStagePaths = [Paths.double.actual, Paths.empty.actual];
const preStagePathsNames = new WeakMap();

// ? Record human-readable name for each preset (*ACTUAL* preset path)
addPathsKeys.forEach((k) => preStagePathsNames.set(Paths[k].actual, k));

const tests = ([
  ['scope', OptionsMeta.testScope],
  ['-', OptionsMeta.scopeOmit],
  ['--', OptionsMeta.scopeBasename],
  ['-o', OptionsMeta.scopeOmit],
  ['-a', OptionsMeta.scopeAsIs],
  ['-b', OptionsMeta.scopeBasename],
  ['-f', OptionsMeta.scopeFull],
  ['--scope-omit', OptionsMeta.scopeOmit],
  ['--scope-as-is', OptionsMeta.scopeAsIs],
  ['--scope-basename', OptionsMeta.scopeBasename],
  ['--scope-full', OptionsMeta.scopeFull]
] as [string, typeof OptionsMeta.value][])
  .flatMap(([scopeArg, optionsMeta]) =>
    preStagePaths.flatMap((preStagedPaths) =>
      addPathsKeys.flatMap((addPathsKey) => {
        if (preStagedPaths !== Paths.empty || addPathsKey != 'empty') {
          const computedScope = optionsMeta.scope[addPathsKey]
            ? `(${optionsMeta.scope[addPathsKey]})`
            : '';

          return {
            preStagedPaths: preStagedPaths,
            stagePaths: Paths[addPathsKey].actual,
            passedPaths: Paths[addPathsKey],
            programArgs: [...Paths[addPathsKey], 'type', scopeArg, 'the message'],
            commitArgs: optionsMeta.args || {},
            commitMessage: `type${computedScope}: the message`,
            titleSuffix: `preset=${addPathsKey},pre_stage=${preStagePathsNames.get(
              preStagedPaths
            )}`
          };
        }

        return null;
      })
    )
  )
  .filter(<T>(t: T | null | undefined): t is T => Boolean(t));

export type Fixtures = typeof tests & {
  meta: {
    options: typeof OptionsMeta;
    paths: typeof Paths;
    addPathsKeys: typeof addPathsKeys;
    preStagePaths: typeof preStagePaths;
  };
};

// ? The test configuration objects (fixtures) imported by various test suites
const fixtures = ([
  ...tests,
  ...[
    ['--scope-full', 'path', 'file1', 'type', 'the message'],
    ['path', '--scope-full', 'file1', 'type', 'the message'],
    ['path', 'file1', '--scope-full', 'type', 'the message'],
    ['path', 'file1', 'type', '--scope-full', 'the message'],
    ['path', 'file1', 'type', 'the message', '--scope-full']
  ].map((programArgs) => ({
    preStagedPaths: [],
    stagePaths: ['path/to/file2', 'file1'],
    passedPaths: ['path', 'file1'],
    programArgs,
    commitArgs: { scopeFull: true },
    commitMessage: 'type(path/to/file2): the message',
    titleSuffix: 'preset=custom,post_test=true'
  }))
] as unknown) as Fixtures;

fixtures.meta = {
  options: OptionsMeta,
  paths: Paths,
  addPathsKeys,
  preStagePaths
};

export default fixtures;
