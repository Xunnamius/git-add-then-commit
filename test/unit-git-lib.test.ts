import { name as pkgName } from '../package.json';
import { asMockedFunction } from './setup';
import * as lib from '../src/git-lib';
import git from 'simple-git';
import execa, { ExecaChildProcess } from 'execa';

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

mockedCommit.mockImplementation(
  () => (mockCommitResult as unknown) as Response<CommitResult>
);

beforeAll(() => {
  // ? Implement default mocks here (instead of immediately)
  mockedGit.mockImplementation(
    () =>
      (({
        add: mockedAdd,
        commit: mockedCommit,
        status: mockedStatus,
        checkIsRepo: mockedCheckIsRepo
      } as unknown) as SimpleGit)
  );
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
      mockCommitResult.commit = '';
      await expect(lib.makeCommit('type(scope): message')).toReject();
      expect(mockedCommit).toBeCalledWith('type(scope): message');
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

      const stagedPaths = ['path1', 'path2', 'path3'];
      mockedStatus.mockReturnValueOnce(({
        staged: stagedPaths
      } as unknown) as Response<StatusResult>);

      expect(await lib.getStagedPaths()).toBe(stagedPaths);
      expect(mockedStatus).toHaveBeenCalled();
    });
  });

  describe('::fullname', () => {
    it('returns { ambiguous: false, file: "..." } on non-ambiguous paths', async () => {
      expect.hasAssertions();

      mockedExeca.mockImplementation(
        () =>
          (({
            stdout: 'non/ambiguous/dir/path/to/files/file1.js'
          } as unknown) as ExecaChildProcess<Buffer>)
      );

      expect(await lib.fullname('non/ambiguous/dir/path')).toStrictEqual({
        ambiguous: false,
        file: 'non/ambiguous/dir/path/to/files/file1.js'
      });

      expect(
        await lib.fullname('non/ambiguous/dir/path/to/files/file1.js')
      ).toStrictEqual({
        ambiguous: false,
        file: 'non/ambiguous/dir/path/to/files/file1.js'
      });
    });

    it('returns { ambiguous: true, files: [...] } on ambiguous paths', async () => {
      expect.hasAssertions();

      mockedExeca.mockImplementation(
        () =>
          (({
            stdout:
              'ambiguous/dir/path/to/files/file1.js\n' +
              'ambiguous/dir/path/to/files/file2.js\n' +
              'ambiguous/dir/path/to/files/file3.js'
          } as unknown) as ExecaChildProcess<Buffer>)
      );

      expect(await lib.fullname('ambiguous/dir/path')).toStrictEqual({
        ambiguous: true,
        files: [
          'ambiguous/dir/path/to/files/file1.js',
          'ambiguous/dir/path/to/files/file2.js',
          'ambiguous/dir/path/to/files/file3.js'
        ]
      });
    });

    it('rejects if untracked/non-existent path', async () => {
      expect.hasAssertions();

      mockedExeca.mockImplementation(
        () => (({ stdout: '' } as unknown) as ExecaChildProcess<Buffer>)
      );

      await expect(lib.fullname('non-existent/dir/path')).toReject();
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
