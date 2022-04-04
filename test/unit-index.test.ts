/* eslint-disable jest/no-conditional-in-test */
import { configureProgram } from '../src/index';
import { asMockedFunction, withMockedArgv, withMockedOutput } from './setup';
import fixtures from './fixtures';

import {
  commonAncestor,
  fullname,
  getStagedPaths,
  getGitRepoRoot,
  isGitRepo,
  makeCommit,
  stagePaths
} from '../src/git-lib';

import type { Context } from '../src/index';

jest.mock('../src/git-lib');

const mockStagedPaths = new Set<string>();
const mockedCommonAncestor = asMockedFunction(commonAncestor);
const mockedFullname = asMockedFunction(fullname);
const mockedGetStagedPaths = asMockedFunction(getStagedPaths);
const mockedIsGitRepo = asMockedFunction(isGitRepo);
const mockedMakeCommit = asMockedFunction(makeCommit);
const mockedStagePaths = asMockedFunction(stagePaths);
const mockedGetGitRepoRoot = asMockedFunction(getGitRepoRoot);

const getProgram = () => {
  const ctx = configureProgram();
  ctx.program.exitProcess(false);
  return ctx;
};

const runProgram = async (argv: string[], ctx?: Context) => {
  return (ctx || getProgram()).parse(argv);
};

// ? Captures output and mocks argv
const withMocks = async (
  fn: Parameters<typeof withMockedOutput>[0],
  argv: string[] = [],
  options?: Parameters<typeof withMockedArgv>[2]
) => withMockedArgv(() => withMockedOutput(fn), argv, options);

beforeEach(() => {
  mockStagedPaths.add('some-random-file'); // ? Needs to be >=1 staged or else!
  // ? Use mockImplementation* over mockReturnValue* for Promise rejection
  mockedFullname.mockImplementation(() => Promise.reject('top-level error'));
  mockedGetStagedPaths.mockImplementation(async () => Array.from(mockStagedPaths));
  mockedIsGitRepo.mockReturnValue(Promise.resolve(true));
});

describe('::configureProgram', () => {
  it('creates new yargs instance when called with 0 arguments', async () => {
    expect.hasAssertions();
    await withMocks(async () => {
      expect(configureProgram().program).not.toBeNil();
    });
  });

  it('errors if called with bad args', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await Promise.allSettled([
        expect(runProgram([])).rejects.toMatchObject({
          message: expect.toInclude('must pass all required arguments')
        }),
        expect(runProgram(['file'])).rejects.toMatchObject({
          message: expect.toInclude('must pass all required arguments')
        }),
        expect(runProgram(['file', 'file'])).rejects.toMatchObject({
          message: expect.toInclude('must pass all required arguments')
        }),
        expect(runProgram(['--scope-omit'])).rejects.toMatchObject({
          message: expect.toInclude('must pass all required arguments')
        }),
        expect(runProgram(['file', '--scope-omit'])).rejects.toMatchObject({
          message: expect.toInclude('must pass all required arguments')
        }),
        expect(
          runProgram(['type', '--scope-omit', '--scope-basename', 'message X'])
        ).rejects.toMatchObject({
          message: expect.toInclude('only one scope option is allowed')
        }),
        expect(
          runProgram([
            '--scope-omit',
            '--scope-basename',
            '--scope-as-is',
            '--scope-full'
          ])
        ).rejects.toMatchObject({
          message: expect.toInclude('only one scope option is allowed')
        })
      ]);
    });
  });

  it("doesn't error when called with confusing (but legal) args", async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      // * These types of errors should be caught by commit-lint!
      await expect(
        runProgram(['type', '--scope-omit', 'scope', 'message 1'])
      ).resolves.toBeDefined();
      await expect(
        runProgram(['file1', 'file2', 'type', 'message 2'])
      ).resolves.toBeDefined();

      expect(mockedMakeCommit).toBeCalledWith('scope: message 1', true, false);
      expect(mockedMakeCommit).toBeCalledWith('file2(type): message 2', true, false);
    });
  });

  it('errors if called without paths and no files are staged', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockStagedPaths.clear();

      await expect(runProgram(['type', 'scope', 'message 3'])).rejects.toMatchObject({
        message: expect.toInclude('must stage a file or pass a path')
      });
    });
  });

  it('errors if called outside a git repo', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedIsGitRepo.mockReturnValueOnce(Promise.resolve(false));

      await expect(
        runProgram(['file', 'type', 'scope', 'message Y'])
      ).rejects.toMatchObject({
        message: expect.toInclude('not a git repository')
      });
    });
  });

  it("errors if strange condition occurs where there's actually nothing to commit", async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockStagedPaths.clear();
      mockedGetStagedPaths.mockReturnValueOnce(Promise.resolve([]));

      await expect(
        runProgram(['file', 'type', 'scope', 'message Z'])
      ).rejects.toMatchObject({
        message: expect.toInclude('nothing to commit')
      });

      expect(mockedGetStagedPaths).toBeCalled();
    });
  });

  it('errors if makeCommit errors', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedMakeCommit.mockImplementationOnce(async () => {
        throw new Error('badness');
      });

      await expect(
        runProgram(['file', 'type', 'scope', 'message W'])
      ).rejects.toMatchObject({ message: 'badness' });

      expect(mockedMakeCommit).toBeCalled();
    });
  });

  it('skips verification when --no-verify encountered', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(
        runProgram(['file', 'type', '-', 'message V', '--no-verify'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type: message V', true, true);
    });
  });

  it('uses simple verification when --verify=simple encountered', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(
        runProgram(['file', 'type', '-', 'message U', '--verify=simple'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type: message U', true, 'simple');
    });
  });

  it('-v simple is equivalent to --verify=simple', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(
        runProgram(['file', 'type', '-', 'message T', '-v', 'simple'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type: message T', true, 'simple');
    });
  });

  it('skips verification when --verify=false encountered', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(
        runProgram(['file', 'type', '-', 'message S', '--verify=false'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type: message S', true, true);
    });
  });

  it('does not skip verification when --verify=true encountered', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(
        runProgram(['file', 'type', '-', 'message R', '--verify=true'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type: message R', true, false);
    });
  });

  it('does not skip verification when no verification flags encountered', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(runProgram(['file', 'type', '-', 'message Q'])).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type: message Q', true, false);
    });
  });

  it('double-colon works as monorepo pseudo-pathspec path shortcut', async () => {
    expect.hasAssertions();

    mockedGetGitRepoRoot.mockImplementation(() => Promise.resolve('/repo-root'));

    await withMocks(async () => {
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'packages/pkg-1/src/file.js' })
      );

      await expect(runProgram(['::', 'type', '--', 'message 0'])).resolves.toBeDefined();

      expect(mockedFullname).toBeCalledWith('/repo-root/packages/');
      expect(mockedMakeCommit).toBeCalledWith('type(file.js): message 0', true, false);

      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'packages/pkg-1/src/file.js' })
      );

      await expect(
        runProgram(['::pkg-1', 'type', '--', 'message 1'])
      ).resolves.toBeDefined();

      expect(mockedFullname).toBeCalledWith('/repo-root/packages/pkg-1');
      expect(mockedMakeCommit).toBeCalledWith('type(file.js): message 1', true, false);

      mockedFullname.mockImplementationOnce(() => Promise.reject('#2'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'packages/pkg-1/src/index.ts' })
      );

      await expect(
        runProgram(['::pkg-1/src/index.ts', 'type', '---', 'message 2'])
      ).resolves.toBeDefined();

      expect(mockedFullname).toBeCalledWith('/repo-root/packages/pkg-1/src/index.ts');
      expect(mockedMakeCommit).toBeCalledWith(
        'type(packages/pkg-1): message 2',
        true,
        false
      );

      mockedFullname.mockImplementationOnce(() => Promise.reject('#3'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'packages/pkg-1/src/index.ts' })
      );

      await expect(
        runProgram(['packages/pkg-1/src/index.ts', 'type', '---', 'message 3'])
      ).resolves.toBeDefined();

      expect(mockedFullname).toBeCalledWith('/repo-root/packages/pkg-1/src/index.ts');
      expect(mockedMakeCommit).toBeCalledWith(
        'type(packages/pkg-1): message 3',
        true,
        false
      );
    });
  });

  it('"packages/package-name/..." paths are committed with commit scope "packages/package-name" when using --scope-root', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'packages/pkg-1/script.ts' })
      );

      await expect(
        runProgram(['packages/pkg-1/script.ts', 'type', '---', 'message 1'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith(
        'type(packages/pkg-1): message 1',
        true,
        false
      );

      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'packages/pkg-1/script-a/index.ts' })
      );

      await expect(
        runProgram(['../../packages/pkg-1/script-a/index.ts', 'type', '---', 'message 2'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith(
        'type(packages/pkg-1): message 2',
        true,
        false
      );
    });
  });

  it('ambiguous "packages/package-name/..." paths are committed with proper commit scope when using --scope-root', async () => {
    expect.hasAssertions();

    mockedGetGitRepoRoot.mockImplementation(() => Promise.resolve('/repo-root'));

    await withMocks(async () => {
      mockedCommonAncestor.mockReturnValueOnce('packages');
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({
          ambiguous: true,
          files: ['packages/pkg-1/script.ts', 'packages/pkg-2/script.ts']
        })
      );

      await expect(
        runProgram(['packages/**/*', 'type', '---', 'message 1'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(packages): message 1', true, false);

      mockedCommonAncestor.mockReturnValueOnce('packages');
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({
          ambiguous: true,
          files: ['packages/pkg-1/script-a/index.ts', 'packages/pkg-2/script-b/index.ts']
        })
      );

      await expect(
        runProgram(['../../packages', 'type', '---', 'message 2'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(packages): message 2', true, false);

      mockedCommonAncestor.mockReturnValueOnce('packages/pkg-1');
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({
          ambiguous: true,
          files: ['packages/pkg-1/script-a/index.ts', 'packages/pkg-1/script-b/index.ts']
        })
      );

      await expect(
        runProgram(['::pkg-1', 'type', '---', 'message 3'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith(
        'type(packages/pkg-1): message 3',
        true,
        false
      );
    });
  });

  it('"external*/..." paths are committed with commit scope "externals" when using --scope-root', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'external-scripts/script.ts' })
      );

      await expect(
        runProgram(['external-scripts/script.ts', 'type', '---', 'message 1'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(externals): message 1', true, false);

      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'external-scripts/script-a/index.ts' })
      );

      await expect(
        runProgram([
          '../../external-scripts/script-a/index.ts',
          'type',
          '---',
          'message 2'
        ])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(externals): message 2', true, false);

      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'external/script-a/index.ts' })
      );

      await expect(
        runProgram(['../../external/script-a/index.ts', 'type', '---', 'message 3'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(externals): message 3', true, false);

      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'externals/script-a/index.ts' })
      );

      await expect(
        runProgram(['../../externals/script-a/index.ts', 'type', '---', 'message 4'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(externals): message 4', true, false);

      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'externalbin/script-a/index.ts' })
      );

      await expect(
        runProgram(['../../externalized/script-a/index.ts', 'type', '---', 'message 5'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(externals): message 5', true, false);
    });
  });

  it('ambiguous "external*/..." paths are committed with proper commit scope when using --scope-root', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedCommonAncestor.mockReturnValueOnce('external-scripts');
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({
          ambiguous: true,
          files: ['external-scripts/script-1.ts', 'external-scripts/script-2.ts']
        })
      );

      await expect(
        runProgram(['external-scripts', 'type', '---', 'message 1'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(externals): message 1', true, false);

      mockedCommonAncestor.mockReturnValueOnce('external');
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({
          ambiguous: true,
          files: ['external/script-a/index.ts', 'external/script-b/index.ts']
        })
      );

      await expect(
        runProgram(['../../external', 'type', '---', 'message 2'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(externals): message 2', true, false);

      mockedCommonAncestor.mockReturnValueOnce('externalbin');
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({
          ambiguous: true,
          files: ['externalbin/script-a/index.ts', 'externalbin/script-b/index.ts']
        })
      );

      await expect(
        runProgram(['../../externalized', 'type', '---', 'message 3'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(externals): message 3', true, false);
    });
  });

  it('exclamation-colon used when breaking change text encountered in commit message', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(
        runProgram(['file', 'type', '-', 'message\n\nBREAKING: big change'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith(
        'type!: message\n\nBREAKING: big change',
        true,
        false
      );
    });

    await withMocks(async () => {
      await expect(
        runProgram(['file', 'type', 'scope', 'message\n\nBREAKING CHANGE: big change'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith(
        'type(scope)!: message\n\nBREAKING CHANGE: big change',
        true,
        false
      );
    });
  });

  it('calls to Context::parse transform aliases properly (-)', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(runProgram(['file', 'type', '-', 'message P'])).resolves.toBeDefined();
      expect(mockedFullname).toBeCalledTimes(1);
      expect(mockedMakeCommit).toBeCalledWith('type: message P', true, false);
    });
  });

  it('calls to Context::parse transform aliases properly (--)', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'file' })
      );

      await expect(
        runProgram(['file', 'type', '--', 'message O'])
      ).resolves.toBeDefined();
      expect(mockedFullname).toBeCalledTimes(2);
      expect(mockedMakeCommit).toBeCalledWith('type(file): message O', true, false);
    });
  });

  it('calls to Context::parse transform aliases properly (--) #2', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'path/to/a/file2' })
      );

      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedFullname).toBeCalledTimes(2);
      expect(mockedMakeCommit).toBeCalledWith('type2(file2): message2', true, false);
    }, ['path/to/a/file2', 'type2', '--', 'message2']);
  });

  it('calls to Context::parse transform aliases properly (---)', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'package.json' })
      );

      await expect(
        runProgram(['package.json', 'type', '---', 'message N'])
      ).resolves.toBeDefined();
      expect(mockedFullname).toBeCalledTimes(2);
      expect(mockedMakeCommit).toBeCalledWith('type(package): message N', true, false);
    });
  });

  it('calls to Context::parse transform aliases properly (---) #2', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedFullname.mockImplementationOnce(() => Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'path/to/a/package.json' })
      );

      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedFullname).toBeCalledTimes(2);
      expect(mockedMakeCommit).toBeCalledWith('type2(path): message2', true, false);
    }, ['path/to/a/package.json', 'type2', '---', 'message2']);
  });

  it('commit type is always lowercased', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(runProgram(['file', 'TyPe', '-', 'message M'])).resolves.toBeDefined();
      expect(mockedFullname).toBeCalledTimes(1);
      expect(mockedMakeCommit).toBeCalledWith('type: message M', true, false);
    });
  });

  it('--scope-full works with non-ambiguous first path with file extension', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['b/file.json', 'b/other-file'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'b/file.json' })
    );

    await withMocks(async () => {
      await expect(
        runProgram([...addPathsToMockStaged, 'type', '-f', 'message L'])
      ).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });
  });

  it('--scope-full works with non-ambiguous first path without file extension', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['b/file', 'b/other-file'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'b/file' })
    );

    await withMocks(async () => {
      await expect(
        runProgram([...addPathsToMockStaged, 'type', '-f', 'message K'])
      ).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });
  });

  it('--scope-full works with staged paths with no path args', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['a/file1', 'a/file2', 'a/file2'];

    mockedCommonAncestor.mockReturnValueOnce('a');

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
    }, ['type', '-f', 'message J']);
  });

  it('--scope-full works with single staged path with no path args', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['x/file'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
    }, ['type', '-f', 'message I']);
  });

  it('--scope-full works with staged paths with path args', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['a/file1', 'a/file2', 'a/file3'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockImplementationOnce(() => Promise.reject('#3'));
    mockedFullname.mockImplementationOnce(() => Promise.reject('#4'));
    mockedFullname.mockImplementationOnce(() => Promise.reject('#5'));
    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'a/file1' })
    );

    addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    }, [...addPathsToMockStaged, 'type', '-f', 'message H']);
  });

  it('--scope-full works with ambiguous first path with common ancestor', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['file1', 'file2', 'file3'];

    mockedCommonAncestor.mockReturnValueOnce(null);

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({
        ambiguous: true,
        files: [
          'file1/actually/path/to/many1',
          'file1/actually/path/to/many2',
          'file1/actually/path/to/many3'
        ]
      })
    );

    await withMocks(async () => {
      await expect(runProgram([])).rejects.toMatchObject({
        message: expect.stringContaining('ambiguous')
      });

      expect(mockedCommonAncestor).toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    }, [...addPathsToMockStaged, 'type', '-f', 'message G']);
  });

  it('--scope-full errors with ambiguous first path and no common ancestor', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['file1', 'file2', 'file3'];

    mockedCommonAncestor.mockReturnValueOnce(null);

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({
        ambiguous: true,
        files: [
          'file1/actually/path/to/many1',
          'file1/actually/path/to/many2',
          'file1/actually/path/to/many3'
        ]
      })
    );

    await withMocks(async () => {
      await expect(runProgram([])).rejects.toMatchObject({
        message: expect.stringContaining('ambiguous')
      });

      expect(mockedCommonAncestor).toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    }, [...addPathsToMockStaged, 'type', '-f', 'message F']);
  });

  it('--scope-root works with non-ambiguous non-index path using 1st directory', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['b/file.json', 'b/other-file.json'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'b/file.json' })
    );

    await withMocks(async () => {
      await expect(
        runProgram([...addPathsToMockStaged, 'type', '---', 'message E'])
      ).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(b): message E', true, false);
    });
  });

  it('--scope-root works with non-ambiguous index path at root with ext', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['index.json'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'index.json' })
    );

    await withMocks(async () => {
      await expect(
        runProgram([...addPathsToMockStaged, 'type', '---', 'message D'])
      ).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(index): message D', true, false);
    });
  });

  it('--scope-root works with non-ambiguous index path at root with multi-ext', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['index.json'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: '.index.xedni.2.json' })
    );

    await withMocks(async () => {
      await expect(
        runProgram([...addPathsToMockStaged, 'type', '---', 'message C'])
      ).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(index): message C', true, false);
    });
  });

  it('--scope-root works with non-ambiguous index path at root without ext', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['index'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'index' })
    );

    await withMocks(async () => {
      await expect(
        runProgram([...addPathsToMockStaged, 'type', '---', 'message B'])
      ).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(index): message B', true, false);
    });
  });

  it('--scope-root works with non-ambiguous non-index path with matching 1st directory and non-matching 2nd directory', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['type/second.directory/file.json'];

    addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'type/second.directory/file.json' })
    );

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(second): message A', true, false);
    }, ['type', '---', 'message A']);
  });

  it('--scope-root works with non-ambiguous non-index path with matching 1st directory and non-matching 2nd directory with leading dot', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['type/.github/file.json'];

    addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'type/.github/file.json' })
    );

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(github): message 9', true, false);
    }, ['type', '---', 'message 9']);
  });

  it('--scope-root works with non-ambiguous non-index path with matching 1st directory and no 2nd directory', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['type/feat.json'];

    addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'type/file.json' })
    );

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(feat): message 8', true, false);
    }, ['type', '-r', 'message 8']);
  });

  it('--scope-root omits scope with non-ambiguous index path with matching 1st directory and no 2nd directory', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['type/index.json'];

    addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'type/index.json' })
    );

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type: message 7', true, false);
    }, ['type', '---', 'message 7']);
  });

  it('--scope-root omits scope with non-ambiguous non-index path with matching 1st directory and matching 2nd directory', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['type/type/file.json'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'type/type/file.json' })
    );

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type: message 6', true, false);
    }, [...addPathsToMockStaged, 'type', '---', 'message 6']);
  });

  it('--scope-root works with ambiguous non-index path with common ancestor using 1st directory', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['fileX'];

    mockedCommonAncestor.mockReturnValueOnce('file1/actually/path/to');

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({
        ambiguous: true,
        files: [
          'file1/actually/path/to/many1',
          'file1/actually/path/to/many2',
          'file1/actually/path/to/many3'
        ]
      })
    );

    await withMocks(async () => {
      await expect(
        runProgram([...addPathsToMockStaged, 'type', '---', 'message 5'])
      ).resolves.toBeDefined();
      expect(mockedCommonAncestor).toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(file1): message 5', true, false);
    });
  });

  it('--scope-root omits scope with ambiguous index path with common ancestor with first and 2nd directory matching', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['type/type', 'file2.json', 'file3.json'];

    mockedCommonAncestor.mockReturnValueOnce('type/type');

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({
        ambiguous: true,
        files: ['type/type/index.js', 'type/type/file1']
      })
    );

    await withMocks(async () => {
      await expect(runProgram([])).resolves.toBeDefined();
      expect(mockedCommonAncestor).toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type: message 4', true, false);
    }, [...addPathsToMockStaged, 'type', '---', 'message 4']);
  });

  it('--scope-root errors with ambiguous path with no common ancestor', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['type', 'file2.json', 'file3.json'];

    mockedCommonAncestor.mockReturnValueOnce(null);

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({
        ambiguous: true,
        files: ['x', 'y', 'z']
      })
    );

    await withMocks(async () => {
      await expect(runProgram([])).rejects.toMatchObject({
        message: expect.stringContaining('ambiguous')
      });

      expect(mockedCommonAncestor).toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    }, [...addPathsToMockStaged, 'type', '---', 'message 3']);
  });

  it('--scope-basename errors with ambiguous first path', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    mockedStagePaths.mockImplementationOnce(
      async () => void mockStagedPaths.add('b/file1')
    );

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: true, files: ['b/file1', 'b/file1'] })
    );

    await withMocks(async () => {
      await expect(
        runProgram(['b/file1', 'type', '--', 'message 2'])
      ).rejects.toMatchObject({ message: expect.stringContaining('ambiguous') });

      expect(mockedStagePaths).toBeCalledTimes(1);
      expect(mockedFullname).toBeCalledTimes(1);
    });
  });

  it('--scope-basename works with non-ambiguous staged file', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();
    mockStagedPaths.add('b/file1.js');

    await withMocks(async () => {
      await expect(runProgram(['type', '--', 'message 1'])).resolves.toBeDefined();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(file1.js): message 1', true, false);
    });
  });

  it('does not re-stage partially pre-staged path args', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();
    mockStagedPaths.add('b/file1.js');
    mockStagedPaths.add('c/file1.js');

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: true, files: ['b/file2.js', 'b/file1.js'] })
    );

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'c/file1.js' })
    );

    await withMocks(async () => {
      await expect(
        runProgram(['b', 'c', 'type', '--', 'message 0'])
      ).rejects.toMatchObject({
        message: expect.toInclude('dangerous operation rejected')
      });
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('does re-stage partially pre-staged paths with --force', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();
    mockStagedPaths.add('b/file1.js');

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'b/file1.js' })
    );

    await withMocks(async () => {
      await expect(
        runProgram(['b', 'type', '--', 'message', '--force'])
      ).resolves.toBeDefined();
      expect(mockedFullname).toBeCalledTimes(1);
      expect(mockedMakeCommit).toBeCalledWith('type(file1.js): message', true, false);
    });
  });

  it('only derived scopes are lowercased #1', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(runProgram(['type', 'SCOPE', 'message1'])).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(SCOPE): message1', true, false);
      expect(mockedStagePaths).toBeCalledWith([]);
      expect(mockedFullname).not.toBeCalled();
    });
  });

  it('only derived scopes are lowercased #2', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('file1')
      );

      await expect(
        runProgram(['file1', 'type', 'SCOPE', 'message2'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(SCOPE): message2', true, false);
      expect(mockedStagePaths).toBeCalled();
    });
  });

  it('scopes are always lowercased #1', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('FILE1')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#6'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'FILE1' })
      );

      await expect(
        runProgram(['FILE1', 'type', '--', 'message3'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(file1): message3', true, false);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('scopes are always lowercased #2', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#7'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(runProgram(['PATH', 'type', '--', 'message4'])).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(file2): message4', true, false);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('scopes are always lowercased #3', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#8'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(
        runProgram(['PATH/TO/FILE2', 'type', '--', 'message5'])
      ).resolves.toBeDefined();

      expect(mockedMakeCommit).toBeCalledWith('type(file2): message5', true, false);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('scopes are always lowercased #4', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('FILE1')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#9'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'FILE1' })
      );

      await expect(
        runProgram(['FILE1', 'type', '-f', 'message6'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(file1): message6', true, false);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('scopes are always lowercased #5', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#10'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(runProgram(['PATH', 'type', '-f', 'message7'])).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith(
        'type(path/to/file2): message7',
        true,
        false
      );
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('scopes are always lowercased #6', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#11'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(
        runProgram(['PATH/TO/FILE2', 'type', '-f', 'message8'])
      ).resolves.toBeDefined();

      expect(mockedMakeCommit).toBeCalledWith(
        'type(path/to/file2): message8',
        true,
        false
      );
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('scopes are always lowercased #7', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('FILE1.JsOn')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#12'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'FILE1.JsOn' })
      );

      await expect(
        runProgram(['FILE1.JsOn', 'type', '-r', 'message6'])
      ).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(file1): message6', true, false);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('scopes are always lowercased #8', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2.JsOn')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#13'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2.JsOn' })
      );

      await expect(runProgram(['PATH', 'type', '-r', 'message7'])).resolves.toBeDefined();
      expect(mockedMakeCommit).toBeCalledWith('type(path): message7', true, false);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  it('scopes are always lowercased #9', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2.JsOn')
      );
      mockedFullname.mockImplementationOnce(() => Promise.reject('#14'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2.JsOn' })
      );

      await expect(
        runProgram(['PATH/TO/FILE2.JsOn', 'type', '-r', 'message8'])
      ).resolves.toBeDefined();

      expect(mockedMakeCommit).toBeCalledWith('type(path): message8', true, false);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  // eslint-disable-next-line jest/require-hook
  fixtures.forEach((test, ndx) => {
    const [argName] = Object.entries(test.commitArgs).find(([_, v]) => Boolean(v)) || [
      '(none)'
    ];

    if (
      !test.passedPaths.length &&
      ['scopeFull', 'scopeRoot', 'scopeBasename', 'scopeAsIs'].includes(argName)
    ) {
      it(`errors with ambiguous pre-staged paths (${test.preStagedPaths.length} > 1) (${argName})`, async () => {
        expect.hasAssertions();

        await withMocks(async () => {
          mockStagedPaths.clear();
          test.preStagedPaths.forEach((file) => mockStagedPaths.add(file));

          if (argName == 'scopeFull' || argName == 'scopeRoot') {
            mockedCommonAncestor.mockReturnValueOnce(null);
          }

          await runProgram(test.programArgs).catch((e) => {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(e.message).toInclude(
              argName == 'scopeFull'
                ? '--scope-full'
                : argName == 'scopeBasename'
                ? '--scope-basename'
                : argName == 'scopeRoot'
                ? '--scope-root'
                : '--scope-as-is'
            );
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockedFullname).toBeCalledTimes(test.passedPaths.length);
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockedStagePaths).toBeCalledWith([]);

            if (argName == 'scopeFull' || argName == 'scopeRoot') {
              // eslint-disable-next-line jest/no-conditional-expect
              expect(mockedCommonAncestor).toBeCalled();
            }
          });
        });
      });
    } else {
      it(// eslint-disable-next-line jest/valid-title
      `calls lib functions:: pre-staged: ${test.preStagedPaths.length} added: ${
        test.stagePaths.length
      } scope-arg: ${argName} first-arg: ${
        test.stagePaths.length
          ? test.programArgs[0]
          : test.preStagedPaths[0] + ' (pre-staged)'
      }${test.titleSuffix ? ' [' + test.titleSuffix + ']' : ''}`, async () => {
        expect.hasAssertions();

        await withMocks(async () => {
          if (
            test.passedPaths.length &&
            ['scopeFull', 'scopeRoot', 'scopeBasename'].includes(argName)
          ) {
            // ? Don't trigger dangerous operation check if pre-staged present
            if (test.preStagedPaths.length) {
              test.passedPaths.forEach(() =>
                mockedFullname.mockImplementationOnce(() => Promise.reject('#' + ndx))
              );
            }

            mockedFullname.mockReturnValueOnce(
              Promise.resolve({
                ambiguous: false,
                file: test.stagePaths[0]
              })
            );
          }

          mockStagedPaths.clear();

          mockedStagePaths.mockImplementationOnce(async () =>
            test.stagePaths.forEach((file) => mockStagedPaths.add(file))
          );

          test.preStagedPaths.forEach((file) => mockStagedPaths.add(file));

          await expect(runProgram(test.programArgs)).resolves.toBeDefined();

          if (
            test.passedPaths.length &&
            ['scopeFull', 'scopeRoot', 'scopeBasename'].includes(argName)
          ) {
            // ? fullname() is only called for -f, -r, and -b flags
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockedFullname).toBeCalledWith(test.passedPaths[0]);
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockedFullname).toBeCalledTimes(
              (test.preStagedPaths.length ? test.passedPaths.length : 0) + 1
            );
          } else if (test.preStagedPaths.length) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockedFullname).toBeCalledTimes(test.passedPaths.length);
          }

          expect(mockedStagePaths).toBeCalledWith(Array.from(test.passedPaths));
          expect(mockedMakeCommit).toBeCalledWith(test.commitMessage, true, false);
        });
      });
    }
  });
});
