import { name as pkgName } from '../package.json';
import { asMockedFunction } from './setup';
import * as lib from '../src/git-lib';
import git from 'simple-git';
import execa, { ExecaChildProcess } from 'execa';
import { PassThrough } from 'stream';

import type { SimpleGit, StatusResult, Response, CommitResult } from 'simple-git';

const TEST_IDENTIFIER = 'unit-git-lib';

// ! Note:
// !   - jest.mock calls are hoisted to the top even above imports
// !   - factory function of jest.mock(...) is not guaranteed to run early
// !   - better to manipulate mock in beforeAll() vs using a factory function
jest.mock('simple-git');
jest.mock('execa');

const mockCommitResult = {
  author: null,
  branch: 'main',
  commit: 'xxx', // === '' when commit() fails (otherwise fails silently!)
  root: false,
  summary: { changes: 1, insertions: 0, deletions: 0 }
};

const mockedGit = asMockedFunction(git);
const mockedExeca = asMockedFunction(execa);
const mockedAdd = asMockedFunction<SimpleGit['add']>();
const mockedCommit = asMockedFunction<SimpleGit['commit']>();
const mockedStatus = asMockedFunction<SimpleGit['status']>();
const mockedCheckIsRepo = asMockedFunction<SimpleGit['checkIsRepo']>();
const mockedOutputHandler = asMockedFunction<SimpleGit['outputHandler']>();
const mockedEnv = asMockedFunction<SimpleGit['env']>();

const mockGit = ({
  add: mockedAdd,
  commit: mockedCommit,
  status: mockedStatus,
  checkIsRepo: mockedCheckIsRepo,
  outputHandler: mockedOutputHandler,
  env: mockedEnv
} as unknown) as SimpleGit;

mockedCommit.mockImplementation(
  () => (mockCommitResult as unknown) as Response<CommitResult>
);

mockedEnv.mockImplementation(() => mockGit);

beforeAll(() => {
  // ? Implement default mock here
  mockedGit.mockImplementation(() => mockGit);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe(`${pkgName} [${TEST_IDENTIFIER}]`, () => {
  describe('::stagePaths', () => {
    it('does nothing when passed no paths', async () => {
      expect.hasAssertions();
      await lib.stagePaths([]);
      expect(mockedAdd).not.toHaveBeenCalled();
    });

    it('stages 1 path when passed 1 path', async () => {
      expect.hasAssertions();
      await lib.stagePaths(['my/path']);
      expect(mockedAdd).toBeCalledWith(['my/path']);
    });

    it('stages 2 paths when passed 2 paths', async () => {
      expect.hasAssertions();

      const paths = ['my/path1', 'my/path2'];

      await lib.stagePaths(paths);
      expect(mockedAdd).toBeCalledWith(paths);
    });

    it('stages 3 paths when passed 3 paths', async () => {
      expect.hasAssertions();

      const paths = ['my/path1', 'my/path2', 'my/path3'];

      await lib.stagePaths(paths);
      expect(mockedAdd).toBeCalledWith(paths);
    });
  });

  describe('::makeCommit', () => {
    it('makes proper commit when called', async () => {
      expect.hasAssertions();
      await lib.makeCommit('type(scope): message');
      expect(mockedCommit).toBeCalledWith('type(scope): message');
    });

    it('rejects if commit operation fails', async () => {
      expect.hasAssertions();

      const oldCommit = mockCommitResult.commit;

      mockCommitResult.commit = '';
      await expect(lib.makeCommit('type(scope): message')).rejects.toMatchObject({
        message: 'commit operation failed'
      });
      mockCommitResult.commit = oldCommit;

      expect(mockedCommit).toBeCalledWith('type(scope): message');
    });

    it('pipes git output to process.stdout and process.stderr by default', async () => {
      expect.hasAssertions();

      const mockStdout = new PassThrough();
      const mockStderr = new PassThrough();

      let stdoutWasPiped = false;
      let stderrWasPiped = false;

      const stdoutListener = () => (stdoutWasPiped = true);
      const stderrListener = () => (stderrWasPiped = true);

      process.stdout.addListener('pipe', stdoutListener);
      process.stderr.addListener('pipe', stderrListener);

      mockedOutputHandler.mockImplementationOnce(
        (cb: Parameters<SimpleGit['outputHandler']>[0]) =>
          ((cb && cb('fake', mockStdout, mockStderr, [])) as unknown) as SimpleGit
      );
      await lib.makeCommit('type(scope): message');

      expect(mockedOutputHandler).toHaveBeenCalled();
      expect(stdoutWasPiped).toBeTrue();
      expect(stderrWasPiped).toBeTrue();

      process.stdout.removeListener('pipe', stdoutListener);
      process.stderr.removeListener('pipe', stderrListener);

      mockStdout.end();
      mockStderr.end();
      mockStdout.destroy();
      mockStderr.destroy();
    });

    it('does not pipe git output to process.stdout or process.stderr if pipeOutput = false', async () => {
      expect.hasAssertions();
      await lib.makeCommit('type(scope): message', false);
      expect(mockedOutputHandler).not.toHaveBeenCalled();
    });
  });

  describe('::isGitRepo', () => {
    it('checks is repo', async () => {
      expect.hasAssertions();
      await lib.isGitRepo();
      expect(mockedCheckIsRepo).toBeCalled();
    });
  });

  describe('::getStagedPaths', () => {
    it('returns staged paths', async () => {
      expect.hasAssertions();

      const stagedPathData: [
        string | string[],
        { path: string; index: string; working_dir: string }
      ][] = [
        ['file1', { path: 'file1', index: '?', working_dir: '?' }],
        [
          'path/to/file2',
          {
            path: 'path/to/file2',
            index: ' ',
            working_dir: 'D'
          }
        ],
        ['b/file3', { path: 'b/file3', index: ' ', working_dir: 'D' }],
        ['file4', { path: 'file4', index: ' ', working_dir: 'M' }],
        [
          ['file5', 'file6'],
          {
            path: 'file5 -> file6',
            index: 'R',
            working_dir: ' '
          }
        ]
      ];

      mockedStatus.mockReturnValueOnce(({
        files: stagedPathData.map((p) => p[1])
      } as unknown) as Response<StatusResult>);

      expect(await lib.getStagedPaths()).toStrictEqual(
        stagedPathData.flatMap((p) => (p[1].index != '?' ? p[0] : []))
      );
      expect(mockedStatus).toHaveBeenCalled();
    });
  });

  describe('::fullname', () => {
    it('returns { ambiguous: false, file: "..." } on non-ambiguous paths', async () => {
      expect.hasAssertions();

      mockedExeca.mockImplementationOnce(
        () =>
          (({
            stdout: 'non/ambiguous/dir/path/to/files/file1.js'
          } as unknown) as ExecaChildProcess<Buffer>)
      );

      mockedExeca.mockImplementationOnce(
        () =>
          (({
            stdout: ''
          } as unknown) as ExecaChildProcess<Buffer>)
      );

      expect(await lib.fullname('non/ambiguous/dir/path')).toStrictEqual({
        ambiguous: false,
        file: 'non/ambiguous/dir/path/to/files/file1.js'
      });

      expect(mockedExeca).toBeCalledTimes(2);

      mockedExeca.mockImplementationOnce(
        () =>
          (({
            stdout: 'non/ambiguous/dir/path/to/files/file1.js'
          } as unknown) as ExecaChildProcess<Buffer>)
      );

      mockedExeca.mockImplementationOnce(
        () =>
          (({
            stdout: 'non/ambiguous/dir/path/to/files/file1.js'
          } as unknown) as ExecaChildProcess<Buffer>)
      );

      expect(
        await lib.fullname('non/ambiguous/dir/path/to/files/file1.js')
      ).toStrictEqual({
        ambiguous: false,
        file: 'non/ambiguous/dir/path/to/files/file1.js'
      });

      expect(mockedExeca).toBeCalledTimes(4);
    });

    it('returns { ambiguous: true, files: [...] } on ambiguous paths', async () => {
      expect.hasAssertions();

      mockedExeca.mockImplementationOnce(
        () =>
          (({
            stdout:
              'ambiguous/dir/path/to/files/file1.js\n' +
              'ambiguous/dir/path/to/files/file2.js\n' +
              'ambiguous/dir/to/file3.js'
          } as unknown) as ExecaChildProcess<Buffer>)
      );

      mockedExeca.mockImplementationOnce(
        () =>
          (({
            stdout:
              'ambiguous/dir/path/to/files/file4.js\n' +
              'ambiguous/dir/path/to/files/file2.js\n' +
              'ambiguous/dir/path/to/files/file5.js\n' +
              'ambiguous/dir/to/file3.js'
          } as unknown) as ExecaChildProcess<Buffer>)
      );

      expect(await lib.fullname('ambiguous/dir/path')).toStrictEqual({
        ambiguous: true,
        files: [
          'ambiguous/dir/path/to/files/file1.js',
          'ambiguous/dir/path/to/files/file2.js',
          'ambiguous/dir/to/file3.js',
          'ambiguous/dir/path/to/files/file4.js',
          'ambiguous/dir/path/to/files/file5.js'
        ]
      });

      expect(mockedExeca).toBeCalledTimes(2);
    });

    it('rejects if untracked/non-existent path', async () => {
      expect.hasAssertions();

      mockedExeca.mockImplementationOnce(
        () => (Promise.resolve({ stdout: '' }) as unknown) as ExecaChildProcess<Buffer>
      );

      mockedExeca.mockImplementationOnce(
        () => (Promise.resolve({ stdout: '' }) as unknown) as ExecaChildProcess<Buffer>
      );

      await expect(lib.fullname('non-existent/dir/path')).rejects.toMatchObject({
        message: expect.toInclude('does not refer to any staged files')
      });

      expect(mockedExeca).toBeCalledTimes(2);
    });
  });

  describe('::commonAncestor', () => {
    it('returns common ancestor path', async () => {
      expect.hasAssertions();
      expect(lib.commonAncestor(['a/b/c/d/e', 'a/b/c/f/g'])).toBe('a/b/c');
      expect(lib.commonAncestor(['a/b/file2.jpg', 'a/b/c/d/e/f/g.png'])).toBe('a/b');
    });

    it('returns null if no common ancestor path', async () => {
      expect.hasAssertions();
      expect(lib.commonAncestor(['a/b/file2.jpg', 'b/c/d/e/f/g.png'])).toBeNull();
      expect(lib.commonAncestor(['a.png', 'b.png'])).toBeNull();
    });
  });
});
