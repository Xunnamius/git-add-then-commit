import { configureProgram } from '../src/index';
import { asMockedFunction, withMockedArgv, withMockedOutput } from './setup';
import fixtures from './fixtures';

import {
  commonAncestor,
  fullname,
  getStagedPaths,
  isGitRepo,
  makeCommit,
  stagePaths
} from '../src/git-lib';

import type { Context } from '../src/index';

// ! Note:
// !   - jest.mock calls are hoisted to the top even above imports
// !   - factory function of jest.mock(...) is not guaranteed to run early
// !   - better to manipulate mock in beforeAll() vs using a factory function
jest.mock('../src/git-lib');

const mockStagedPaths = new Set<string>();
const mockedCommonAncestor = asMockedFunction(commonAncestor);
const mockedFullname = asMockedFunction(fullname);
const mockedGetStagedPaths = asMockedFunction(getStagedPaths);
const mockedIsGitRepo = asMockedFunction(isGitRepo);
const mockedMakeCommit = asMockedFunction(makeCommit);
const mockedStagePaths = asMockedFunction(stagePaths);

mockedGetStagedPaths.mockImplementation(async () => Array.from(mockStagedPaths));
mockedIsGitRepo.mockReturnValue(Promise.resolve(true));

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
  mockedFullname.mockImplementation(() => Promise.reject('top-level error'));
});

afterEach(() => {
  mockStagedPaths.clear();
  jest.clearAllMocks();
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
          runProgram(['type', '--scope-omit', '--scope-basename', 'message'])
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
        runProgram(['type', '--scope-omit', 'scope', 'message'])
      ).not.toReject();
      await expect(runProgram(['file1', 'file2', 'type', 'message'])).not.toReject();

      expect(mockedMakeCommit).toBeCalledWith('scope: message', true);
      expect(mockedMakeCommit).toBeCalledWith('file2(type): message', true);
    });
  });

  it('errors if called without paths and no files are staged', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockStagedPaths.clear();

      await expect(runProgram(['type', 'scope', 'message'])).rejects.toMatchObject({
        message: expect.toInclude('must stage a file or pass a path')
      });
    });
  });

  it('errors if called outside a git repo', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedIsGitRepo.mockReturnValueOnce(Promise.resolve(false));

      await expect(
        runProgram(['file', 'type', 'scope', 'message'])
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
        runProgram(['file', 'type', 'scope', 'message'])
      ).rejects.toMatchObject({
        message: expect.toInclude('nothing to commit')
      });

      expect(mockedGetStagedPaths).toBeCalled();
    });
  });

  it('errors if makeCommit fails', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedMakeCommit.mockImplementationOnce(async () => {
        throw new Error('badness');
      });

      await expect(runProgram(['file', 'type', 'scope', 'message'])).toReject();

      expect(mockedMakeCommit).toBeCalled();
    });
  });

  it('calls to Context::parse transform aliases properly #1', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(runProgram(['file', 'type', '-', 'message'])).not.toReject();
      expect(mockedFullname).toBeCalledTimes(1);
      expect(mockedMakeCommit).toBeCalledWith('type: message', true);
    });
  });

  it('calls to Context::parse transform aliases properly #2', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedFullname.mockReturnValueOnce(Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'file' })
      );

      await expect(runProgram(['file', 'type', '--', 'message'])).not.toReject();
      expect(mockedFullname).toBeCalledTimes(2);
      expect(mockedMakeCommit).toBeCalledWith('type(file): message', true);
    });
  });

  it('calls to Context::parse transform aliases properly #3', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedFullname.mockReturnValueOnce(Promise.reject('#1'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'path/to/a/file2' })
      );

      await expect(runProgram([])).not.toReject();
      expect(mockedFullname).toBeCalledTimes(2);
      expect(mockedMakeCommit).toBeCalledWith('type2(file2): message2', true);
    }, ['path/to/a/file2', 'type2', '--', 'message2']);
  });

  it('--scope-full works with non-ambiguous already-basenamed first path arg', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['file1', 'file2', 'file3'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'file1' })
    );

    await withMocks(async () => {
      await expect(runProgram([])).not.toReject();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    }, [...addPathsToMockStaged, 'type', '-f', 'message']);
  });

  it('--scope-full works with ambiguous first path arg with no common ancestor', async () => {
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
      await expect(runProgram([])).toReject();
      expect(mockedCommonAncestor).toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    }, [...addPathsToMockStaged, 'type', '-f', 'message']);
  });

  it('--scope-full works with non-ambiguous more complex first path arg', async () => {
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
        runProgram([...addPathsToMockStaged, 'type', '-f', 'message'])
      ).not.toReject();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });
  });

  it('--scope-full works when adding already-staged file paths with no path args passed', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['a/file1', 'a/file2', 'a/file2'];

    mockedCommonAncestor.mockReturnValueOnce('a');

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));

    await withMocks(async () => {
      await expect(runProgram([])).not.toReject();
      expect(mockedCommonAncestor).toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
    }, ['type', '-f', 'message']);
  });

  it('--scope-full works when adding non-ambiguous already-staged file paths with path args', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['a/file1', 'a/file2', 'a/file2'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    mockedFullname.mockReturnValueOnce(Promise.reject('#3'));
    mockedFullname.mockReturnValueOnce(Promise.reject('#4'));
    mockedFullname.mockReturnValueOnce(Promise.reject('#5'));
    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: false, file: 'a/file1' })
    );

    addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));

    await withMocks(async () => {
      await expect(runProgram([])).not.toReject();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    }, [...addPathsToMockStaged, 'type', '-f', 'message']);
  });

  it('--scope-full works when adding single already-staged file path with no path args passed', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    const addPathsToMockStaged = ['x/file'];

    mockedStagePaths.mockImplementationOnce(async () => {
      addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
    });

    addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));

    await withMocks(async () => {
      await expect(runProgram([])).not.toReject();
      expect(mockedCommonAncestor).not.toBeCalled();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
    }, ['type', '-f', 'message']);
  });

  it('--scope-basename works with ambiguous first path arg', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();

    mockedStagePaths.mockImplementationOnce(
      async () => void mockStagedPaths.add('b/file1')
    );

    mockedFullname.mockReturnValueOnce(
      Promise.resolve({ ambiguous: true, files: ['b/file1', 'b/file1'] })
    );

    await withMocks(async () => {
      await expect(runProgram(['b/file1', 'type', '--', 'message'])).toReject();
      expect(mockedStagePaths).toBeCalledTimes(1);
      expect(mockedFullname).toBeCalledTimes(1);
    });
  });

  it('--scope-basename works with single already-staged file', async () => {
    expect.hasAssertions();

    mockStagedPaths.clear();
    mockStagedPaths.add('b/file1.js');

    await withMocks(async () => {
      await expect(runProgram(['type', '--', 'message'])).not.toReject();
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
      expect(mockedMakeCommit).toBeCalledWith('type(file1.js): message', true);
    });
  });

  it('does not re-stage partially pre-staged paths', async () => {
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
      await expect(runProgram(['b', 'c', 'type', '--', 'message'])).rejects.toMatchObject(
        {
          message: expect.toInclude('dangerous operation rejected')
        }
      );
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
      await expect(runProgram(['b', 'type', '--', 'message', '--force'])).not.toReject();
      expect(mockedFullname).toBeCalledTimes(1);
      expect(mockedMakeCommit).toBeCalledWith('type(file1.js): message', true);
    });
  });

  it('only derived scopes are lowercased #1', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      await expect(runProgram(['type', 'SCOPE', 'message1'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(SCOPE): message1', true);
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

      await expect(runProgram(['file1', 'type', 'SCOPE', 'message2'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(SCOPE): message2', true);
      expect(mockedStagePaths).toBeCalled();
    });
  });

  it('scopes are always lowercased #1', async () => {
    expect.hasAssertions();

    await withMocks(async () => {
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('FILE1')
      );
      mockedFullname.mockReturnValueOnce(Promise.reject('#6'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'FILE1' })
      );

      await expect(runProgram(['FILE1', 'type', '--', 'message3'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(file1): message3', true);
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
      mockedFullname.mockReturnValueOnce(Promise.reject('#7'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(runProgram(['PATH', 'type', '--', 'message4'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(file2): message4', true);
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
      mockedFullname.mockReturnValueOnce(Promise.reject('#8'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(
        runProgram(['PATH/TO/FILE2', 'type', '--', 'message5'])
      ).not.toReject();

      expect(mockedMakeCommit).toBeCalledWith('type(file2): message5', true);
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
      mockedFullname.mockReturnValueOnce(Promise.reject('#9'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'FILE1' })
      );

      await expect(runProgram(['FILE1', 'type', '-f', 'message6'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(file1): message6', true);
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
      mockedFullname.mockReturnValueOnce(Promise.reject('#10'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(runProgram(['PATH', 'type', '-f', 'message7'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(path/to/file2): message7', true);
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
      mockedFullname.mockReturnValueOnce(Promise.reject('#11'));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(
        runProgram(['PATH/TO/FILE2', 'type', '-f', 'message8'])
      ).not.toReject();

      expect(mockedMakeCommit).toBeCalledWith('type(path/to/file2): message8', true);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalledTimes(2);
    });
  });

  fixtures.forEach((test, ndx) => {
    const [argName] = Object.entries(test.commitArgs).find(([_, v]) => Boolean(v)) || [
      '(none)'
    ];

    if (
      !test.passedPaths.length &&
      ['scopeFull', 'scopeBasename', 'scopeAsIs'].includes(argName)
    ) {
      it(`errors with ambiguous pre-staged paths (${test.preStagedPaths.length} > 1) (${argName})`, async () => {
        expect.hasAssertions();

        await withMocks(async () => {
          mockStagedPaths.clear();
          test.preStagedPaths.forEach((file) => mockStagedPaths.add(file));
          argName == 'scopeFull' && mockedCommonAncestor.mockReturnValueOnce(null);

          await runProgram(test.programArgs).catch((e) => {
            expect(e.message).toInclude(
              argName == 'scopeFull'
                ? '--scope-full'
                : argName == 'scopeBasename'
                ? '--scope-basename'
                : '--scope-as-is'
            );
            expect(mockedFullname).toBeCalledTimes(test.passedPaths.length);
            expect(mockedStagePaths).toBeCalledWith([]);
            // eslint-disable-next-line jest/no-conditional-expect
            argName == 'scopeFull' && expect(mockedCommonAncestor).toBeCalled();
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
            ['scopeFull', 'scopeBasename'].includes(argName)
          ) {
            // ? Don't trigger dangerous operation check if pre-staged present
            if (test.preStagedPaths.length) {
              test.passedPaths.forEach(() =>
                mockedFullname.mockReturnValueOnce(Promise.reject('#' + ndx))
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

          await expect(runProgram(test.programArgs)).toResolve();

          if (
            test.passedPaths.length &&
            ['scopeFull', 'scopeBasename'].includes(argName)
          ) {
            // ? fullname() is only called for -f and -b flags
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
          expect(mockedMakeCommit).toBeCalledWith(test.commitMessage, true);
        });
      });
    }
  });
});
