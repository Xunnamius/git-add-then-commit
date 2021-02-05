import { name as pkgName } from '../package.json';
import { configureProgram } from '../src/index';
import { asMockedFunction, setArgv } from './setup';
import fixtures from './fixtures';

import {
  commonAncestor,
  fullname,
  getStagedPaths,
  isGitRepo,
  makeCommit,
  stagePaths
} from '../src/git-lib';

import type { Context } from '../src';

const TEST_IDENTIFIER = 'unit-index';

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

let resetArgv: ReturnType<typeof setArgv>;
let stderrSpy: ReturnType<typeof jest.spyOn>;

beforeAll(() => {
  // ? Store original arguments passed to process
  resetArgv = setArgv([]);

  // ? Suppress Yargs help output to keep test output clean
  if (!process.env.DEBUG)
    stderrSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

beforeEach(() => {
  mockStagedPaths.add('some-random-file'); // ? Needs to be >=1 staged or else!
});

afterEach(() => {
  mockStagedPaths.clear();
  jest.clearAllMocks();
});

afterAll(() => {
  resetArgv();
  if (!process.env.DEBUG) stderrSpy.mockRestore();
});

describe(`${pkgName} [${TEST_IDENTIFIER}]`, () => {
  describe('::configureProgram', () => {
    it('creates new yargs instance when called with 0 arguments', () => {
      expect.hasAssertions();
      expect(configureProgram().program).not.toBeNil();
    });

    it('errors if called with bad args', async () => {
      expect.hasAssertions();

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

    it("doesn't error when called with confusing (but legal) args", async () => {
      expect.hasAssertions();

      // * These types of errors should be caught by commit-lint!
      await expect(
        runProgram(['type', '--scope-omit', 'scope', 'message'])
      ).not.toReject();
      await expect(runProgram(['file1', 'file2', 'type', 'message'])).not.toReject();

      expect(mockedMakeCommit).toBeCalledWith('scope: message', true);
      expect(mockedMakeCommit).toBeCalledWith('file2(type): message', true);
    });

    it('errors if called without paths and no files are staged', async () => {
      expect.hasAssertions();

      mockStagedPaths.clear();

      await expect(runProgram(['type', 'scope', 'message'])).rejects.toMatchObject({
        message: expect.toInclude('must stage a file or pass a path')
      });
    });

    it('errors if called outside a git repo', async () => {
      expect.hasAssertions();

      mockedIsGitRepo.mockReturnValueOnce(Promise.resolve(false));

      await expect(
        runProgram(['file', 'type', 'scope', 'message'])
      ).rejects.toMatchObject({
        message: expect.toInclude('not a git repository')
      });
    });

    it("errors if strange condition occurs where there's actually nothing to commit", async () => {
      expect.hasAssertions();

      mockStagedPaths.clear();
      mockedGetStagedPaths.mockReturnValueOnce(Promise.resolve([]));

      await expect(
        runProgram(['file', 'type', 'scope', 'message'])
      ).rejects.toMatchObject({
        message: expect.toInclude('nothing to commit')
      });

      expect(mockedGetStagedPaths).toBeCalled();
    });

    it('errors if makeCommit fails', async () => {
      expect.hasAssertions();

      mockedMakeCommit.mockImplementationOnce(async () => {
        throw new Error('badness');
      });

      await expect(runProgram(['file', 'type', 'scope', 'message'])).toReject();

      expect(mockedMakeCommit).toBeCalled();
    });

    it('calls to Context::parse transform aliases properly', async () => {
      expect.hasAssertions();

      await expect(runProgram(['file', 'type', '-', 'message'])).not.toReject();

      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'file' })
      );

      await expect(runProgram(['file', 'type', '--', 'message'])).not.toReject();
      expect(mockedFullname).toBeCalledTimes(1);

      setArgv(['path/to/a/file2', 'type2', '--', 'message2']);
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'path/to/a/file2' })
      );

      await expect(runProgram([])).not.toReject();
      expect(mockedFullname).toBeCalledTimes(2);

      expect(mockedMakeCommit).toBeCalledWith('type: message', true);
      expect(mockedMakeCommit).toBeCalledWith('type(file): message', true);
      expect(mockedMakeCommit).toBeCalledWith('type2(file2): message2', true);
    });

    it('--scope-full functions as expected under various cases', async () => {
      expect.hasAssertions();

      let addPathsToMockStaged: string[];

      mockedStagePaths.mockImplementation(async () => {
        addPathsToMockStaged.forEach((a) => mockStagedPaths.add(a));
      });

      // * Testing non-ambiguous already-basenamed first path arg
      addPathsToMockStaged = ['file1', 'file2', 'file3'];
      const resetLocalArgv = setArgv([...addPathsToMockStaged, 'type', '-f', 'message']);
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'file1' })
      );
      mockStagedPaths.clear();

      await expect(runProgram([])).not.toReject();
      expect(mockedCommonAncestor).toBeCalledTimes(0);
      expect(mockedStagePaths).toBeCalledTimes(1);
      expect(mockedFullname).toBeCalledTimes(1);

      // * Testing ambiguous first path arg with no common ancestor
      mockedCommonAncestor.mockReturnValueOnce(null);
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
      mockStagedPaths.clear();

      await expect(runProgram([])).toReject();
      expect(mockedCommonAncestor).toBeCalledTimes(1);
      expect(mockedStagePaths).toBeCalledTimes(2);
      expect(mockedFullname).toBeCalledTimes(2);

      // * Testing non-ambiguous more complex first path arg
      addPathsToMockStaged = ['b/file', 'b/other-file'];
      resetLocalArgv();
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'b/file' })
      );
      mockStagedPaths.clear();

      await expect(
        runProgram([...addPathsToMockStaged, 'type', '-f', 'message'])
      ).not.toReject();
      expect(mockedCommonAncestor).toBeCalledTimes(1);
      expect(mockedStagePaths).toBeCalledTimes(3);
      expect(mockedFullname).toBeCalledTimes(3);

      // * Test adding already-staged file paths with no path args passed
      addPathsToMockStaged = ['a/file1', 'a/file2', 'a/file2'];
      setArgv(['type', '-f', 'message']);
      mockStagedPaths.clear();
      addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));
      mockedCommonAncestor.mockReturnValueOnce('a');

      await expect(runProgram([])).not.toReject();
      expect(mockedCommonAncestor).toBeCalledTimes(2);
      expect(mockedStagePaths).toBeCalledTimes(4);
      expect(mockedFullname).toBeCalledTimes(3);

      // * Test adding non-ambiguous already-staged file paths with path args
      resetLocalArgv();
      setArgv([...addPathsToMockStaged, 'type', '-f', 'message']);
      mockStagedPaths.clear();
      addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'a/file1' })
      );

      await expect(runProgram([])).not.toReject();
      expect(mockedCommonAncestor).toBeCalledTimes(2);
      expect(mockedStagePaths).toBeCalledTimes(5);
      expect(mockedFullname).toBeCalledTimes(4);

      // * Test adding single already-staged file path with no path args passed
      addPathsToMockStaged = ['x/file'];
      resetLocalArgv();
      setArgv(['type', '-f', 'message']);
      mockStagedPaths.clear();
      addPathsToMockStaged.forEach((file) => mockStagedPaths.add(file));

      await expect(runProgram([])).not.toReject();
      expect(mockedCommonAncestor).toBeCalledTimes(2);
      expect(mockedStagePaths).toBeCalledTimes(6);
      expect(mockedFullname).toBeCalledTimes(4);

      mockedStagePaths.mockReset();
    });

    it('--scope-basename functions as expected under various cases', async () => {
      expect.hasAssertions();

      // * Testing ambiguous first path arg
      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('b/file1')
      );
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: true, files: ['b/file1', 'b/file1'] })
      );
      mockStagedPaths.clear();

      await expect(runProgram(['b/file1', 'type', '--', 'message'])).toReject();
      expect(mockedStagePaths).toBeCalledTimes(1);
      expect(mockedFullname).toBeCalledTimes(1);

      // * Testing single already-staged file
      mockStagedPaths.clear();
      mockStagedPaths.add('b/file1.js');

      await expect(runProgram(['type', '--', 'message'])).not.toReject();
      expect(mockedStagePaths).toBeCalledTimes(2);
      expect(mockedFullname).toBeCalledTimes(1);
      expect(mockedMakeCommit).toBeCalledWith('type(file1.js): message', true);
    });

    it('only derived scopes are lowercased #1', async () => {
      expect.hasAssertions();

      await expect(runProgram(['type', 'SCOPE', 'message1'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(SCOPE): message1', true);
      expect(mockedStagePaths).toBeCalledWith([]);
      expect(mockedFullname).not.toBeCalled();
    });

    it('only derived scopes are lowercased #2', async () => {
      expect.hasAssertions();

      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('file1')
      );

      await expect(runProgram(['file1', 'type', 'SCOPE', 'message2'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(SCOPE): message2', true);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).not.toBeCalled();
    });

    it('scopes are always lowercased #1', async () => {
      expect.hasAssertions();

      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('FILE1')
      );
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'FILE1' })
      );

      await expect(runProgram(['FILE1', 'type', '--', 'message3'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(file1): message3', true);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });

    it('scopes are always lowercased #2', async () => {
      expect.hasAssertions();

      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2')
      );
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(runProgram(['PATH', 'type', '--', 'message4'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(file2): message4', true);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });

    it('scopes are always lowercased #3', async () => {
      expect.hasAssertions();

      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2')
      );
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(
        runProgram(['PATH/TO/FILE2', 'type', '--', 'message5'])
      ).not.toReject();

      expect(mockedMakeCommit).toBeCalledWith('type(file2): message5', true);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });

    it('scopes are always lowercased #4', async () => {
      expect.hasAssertions();

      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('FILE1')
      );
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'FILE1' })
      );

      await expect(runProgram(['FILE1', 'type', '-f', 'message6'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(file1): message6', true);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });

    it('scopes are always lowercased #5', async () => {
      expect.hasAssertions();

      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2')
      );
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(runProgram(['PATH', 'type', '-f', 'message7'])).not.toReject();
      expect(mockedMakeCommit).toBeCalledWith('type(path/to/file2): message7', true);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });

    it('scopes are always lowercased #6', async () => {
      expect.hasAssertions();

      mockedStagePaths.mockImplementationOnce(
        async () => void mockStagedPaths.add('PATH/TO/FILE2')
      );
      mockedFullname.mockReturnValueOnce(
        Promise.resolve({ ambiguous: false, file: 'PATH/TO/FILE2' })
      );

      await expect(
        runProgram(['PATH/TO/FILE2', 'type', '-f', 'message8'])
      ).not.toReject();

      expect(mockedMakeCommit).toBeCalledWith('type(path/to/file2): message8', true);
      expect(mockedStagePaths).toBeCalled();
      expect(mockedFullname).toBeCalled();
    });

    fixtures.forEach((test) => {
      const [argName] = Object.entries(test.commitArgs).find(([_, v]) => Boolean(v)) || [
        '(none)'
      ];

      if (
        !test.passedPaths.length &&
        ['scopeFull', 'scopeBasename', 'scopeAsIs'].includes(argName)
      ) {
        it(`errors with ambiguous pre-staged paths (${test.preStagedPaths.length} > 1) (${argName})`, async () => {
          expect.hasAssertions();

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
            expect(mockedFullname).not.toBeCalled();
            expect(mockedStagePaths).toBeCalledWith([]);
            // eslint-disable-next-line jest/no-conditional-expect
            argName == 'scopeFull' && expect(mockedCommonAncestor).toBeCalled();
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

          if (
            test.passedPaths.length &&
            ['scopeFull', 'scopeBasename'].includes(argName)
          ) {
            mockedFullname.mockReturnValueOnce(
              Promise.resolve({
                ambiguous: false,
                file: test.stagePaths[0]
              })
            );
          }

          mockStagedPaths.clear();
          // * Tip: whenever you mock a implementation, either reset it at the
          // * end manually or assert that it has been called!
          mockedStagePaths.mockImplementationOnce(async () =>
            test.stagePaths.forEach((file) => mockStagedPaths.add(file))
          );

          test.preStagedPaths.forEach((file) => mockStagedPaths.add(file));
          await runProgram(test.programArgs);

          if (
            test.passedPaths.length &&
            ['scopeFull', 'scopeBasename'].includes(argName)
          ) {
            // ? fullname() is only called for -f and -b flags
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockedFullname).toBeCalledWith(test.passedPaths[0]);
          }

          expect(mockedStagePaths).toBeCalledWith(Array.from(test.passedPaths));
          expect(mockedMakeCommit).toBeCalledWith(test.commitMessage, true);
        });
      }
    });
  });
});
