export type Path = { [K in keyof typeof Paths]: string };
export type PathActual = string[] & { actual: string[] };

// ? The paths as they might appear in the command `git add paths`
const Paths = {
  single: ['file1.json'] as PathActual,
  short: ['path'] as PathActual,
  full: ['path/to/file2.json'] as PathActual,
  double: ['path', 'file1.json'] as PathActual,
  empty: [] as unknown as PathActual
};

// ? Actual paths as they would exist on a filesystem
Paths.single.actual = Paths.single;
Paths.short.actual = Paths.full;
Paths.full.actual = Paths.full;
Paths.double.actual = ['path/to/file2.json', 'file1.json'];
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
      single: 'file1.json',
      short: 'path',
      full: 'path/to/file2.json',
      double: 'path',
      empty: 'path/to/file2.json'
    },
    args: { scopeAsIs: true }
  },
  scopeBasename: {
    scope: {
      single: 'file1.json',
      short: 'file2.json',
      full: 'file2.json',
      double: 'file2.json',
      empty: 'file2.json'
    },
    args: { scopeBasename: true }
  },
  scopeFull: {
    scope: {
      single: 'file1.json',
      short: 'path/to/file2.json',
      full: 'path/to/file2.json',
      double: 'path/to/file2.json',
      empty: 'path/to/file2.json'
    },
    args: { scopeFull: true }
  },
  scopeRoot: {
    scope: {
      single: 'file1',
      short: 'path',
      full: 'path',
      double: 'path',
      empty: 'path'
    },
    args: { scopeRoot: true }
  },
  dummyScope: {
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

const tests = (
  [
    ['scope', OptionsMeta.dummyScope],
    ['-', OptionsMeta.scopeOmit],
    ['--', OptionsMeta.scopeBasename],
    ['---', OptionsMeta.scopeRoot],
    ['-o', OptionsMeta.scopeOmit],
    ['-a', OptionsMeta.scopeAsIs],
    ['-b', OptionsMeta.scopeBasename],
    ['-f', OptionsMeta.scopeFull],
    ['-r', OptionsMeta.scopeRoot],
    ['--scope-omit', OptionsMeta.scopeOmit],
    ['--scope-as-is', OptionsMeta.scopeAsIs],
    ['--scope-basename', OptionsMeta.scopeBasename],
    ['--scope-full', OptionsMeta.scopeFull],
    ['--scope-root', OptionsMeta.scopeRoot]
  ] as [string, typeof OptionsMeta.value][]
)
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
const fixtures = [
  ...tests,
  ...[
    ['--scope-full', 'path', 'file1.json', 'type', 'the message'],
    ['path', '--scope-full', 'file1.json', 'type', 'the message'],
    ['path', 'file1.json', '--scope-full', 'type', 'the message'],
    ['path', 'file1.json', 'type', '--scope-full', 'the message'],
    ['path', 'file1.json', 'type', 'the message', '--scope-full']
  ].map((programArgs) => ({
    preStagedPaths: [],
    stagePaths: ['path/to/file2.json', 'file1.json'],
    passedPaths: ['path', 'file1.json'],
    programArgs,
    commitArgs: { scopeFull: true },
    commitMessage: 'type(path/to/file2.json): the message',
    titleSuffix: 'preset=order-does-not-matter'
  }))
] as unknown as Fixtures;

fixtures.meta = {
  options: OptionsMeta,
  paths: Paths,
  addPathsKeys,
  preStagePaths
};

export default fixtures;
