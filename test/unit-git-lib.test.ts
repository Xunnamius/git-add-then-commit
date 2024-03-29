/* eslint-disable jest/no-conditional-in-test */
import { asMockedFunction } from './setup';
import * as lib from '../src/git-lib';
import git from 'simple-git';
import execa, { ExecaChildProcess } from 'execa';

import type { SimpleGit, StatusResult, Response, CommitResult } from 'simple-git';

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

const mockGit = {
  add: mockedAdd,
  commit: mockedCommit,
  status: mockedStatus,
  checkIsRepo: mockedCheckIsRepo
} as unknown as SimpleGit;

beforeEach(() => {
  mockedCommit.mockImplementation(
    () => mockCommitResult as unknown as Response<CommitResult>
  );

  mockedGit.mockImplementation(() => mockGit);
});

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
  it('makes execa-based commit when called normally', async () => {
    expect.hasAssertions();

    mockedExeca.mockImplementationOnce(
      () => Promise.resolve() as unknown as ReturnType<typeof mockedExeca>
    );

    await lib.makeCommit('type(scope): message');

    expect(mockedExeca).toBeCalledWith('git', ['commit', '-m', 'type(scope): message'], {
      stdio: 'inherit'
    });
  });

  it('makes silent commit when called with pipeOutput=false', async () => {
    expect.hasAssertions();

    mockedExeca.mockImplementationOnce(
      () => Promise.resolve() as unknown as ReturnType<typeof mockedExeca>
    );

    mockedExeca.mockImplementationOnce(
      () => Promise.reject() as unknown as ReturnType<typeof mockedExeca>
    );

    await expect(lib.makeCommit('type(scope): message', false)).toResolve();
    expect(mockedExeca).toBeCalledWith('git', ['commit', '-m', 'type(scope): message'], {
      stdio: 'pipe'
    });

    await expect(lib.makeCommit('type(scope): message', false)).toReject();
  });

  it('makes unverified commit when noVerify=true', async () => {
    expect.hasAssertions();

    mockedExeca.mockImplementationOnce(
      () => Promise.resolve() as unknown as ReturnType<typeof mockedExeca>
    );

    mockedExeca.mockImplementationOnce(
      () => Promise.resolve() as unknown as ReturnType<typeof mockedExeca>
    );

    await lib.makeCommit('type(scope): message', false, true);
    expect(mockedExeca).toBeCalledWith(
      'git',
      ['commit', '-m', 'type(scope): message', '--no-verify'],
      {
        stdio: 'pipe'
      }
    );

    await lib.makeCommit('type(scope): message', true, true);
    expect(mockedExeca).toBeCalledWith(
      'git',
      ['commit', '-m', 'type(scope): message', '--no-verify'],
      {
        stdio: 'inherit'
      }
    );
  });

  it('rejects if execa-based commit operation fails', async () => {
    expect.hasAssertions();

    mockedExeca.mockImplementationOnce(
      () => Promise.reject() as unknown as ReturnType<typeof mockedExeca>
    );

    await expect(lib.makeCommit('type(scope): message')).rejects.toMatchObject({
      message: 'commit operation failed'
    });

    expect(mockedExeca).toBeCalledWith('git', ['commit', '-m', 'type(scope): message'], {
      stdio: 'inherit'
    });
  });

  it('uses simple verification when --verify=simple encountered', async () => {
    expect.hasAssertions();

    mockedExeca.mockImplementationOnce(
      () => Promise.resolve() as unknown as ReturnType<typeof mockedExeca>
    );

    await expect(lib.makeCommit('type(scope): message', true, 'simple')).toResolve();

    expect(mockedExeca).toBeCalledWith('git', ['commit', '-m', 'type(scope): message'], {
      stdio: 'inherit',
      env: { GAC_VERIFY_SIMPLE: 'true' }
    });
  });
});

describe('::isGitRepo', () => {
  it('checks is repo', async () => {
    expect.hasAssertions();
    await lib.isGitRepo();
    expect(mockedCheckIsRepo).toBeCalled();
  });
});

describe('::getGitRepoRoot', () => {
  it('checks is repo', async () => {
    expect.hasAssertions();

    mockedExeca.mockImplementationOnce(
      () =>
        Promise.resolve({ stdout: '/path/to/root' }) as unknown as ReturnType<
          typeof mockedExeca
        >
    );

    await expect(lib.getGitRepoRoot()).resolves.toBe('/path/to/root');
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
          index: 'A',
          working_dir: ' '
        }
      ],
      ['b/file3', { path: 'b/file3', index: ' ', working_dir: 'D' }],
      ['file4', { path: 'file4', index: 'D', working_dir: 'M' }],
      [
        ['file5', 'file6'],
        {
          path: 'file5 -> file6',
          index: 'R',
          working_dir: ' '
        }
      ]
    ];

    mockedStatus.mockReturnValueOnce({
      files: stagedPathData.map((p) => p[1])
    } as unknown as Response<StatusResult>);

    await expect(lib.getStagedPaths()).resolves.toStrictEqual(
      stagedPathData.flatMap((p) => (['?', ' '].includes(p[1].index) ? [] : p[0]))
    );
    expect(mockedStatus).toHaveBeenCalled();
  });
});

describe('::fullname', () => {
  it('returns { ambiguous: false, file: "..." } on non-ambiguous paths', async () => {
    expect.hasAssertions();

    mockedExeca.mockImplementationOnce(
      () =>
        ({
          stdout: 'non/ambiguous/dir/path/to/files/file1.js'
        } as unknown as ExecaChildProcess<Buffer>)
    );

    mockedExeca.mockImplementationOnce(
      () =>
        ({
          stdout: ''
        } as unknown as ExecaChildProcess<Buffer>)
    );

    await expect(lib.fullname('non/ambiguous/dir/path')).resolves.toStrictEqual({
      ambiguous: false,
      file: 'non/ambiguous/dir/path/to/files/file1.js'
    });

    expect(mockedExeca).toBeCalledTimes(2);

    mockedExeca.mockImplementationOnce(
      () =>
        ({
          stdout: 'non/ambiguous/dir/path/to/files/file1.js'
        } as unknown as ExecaChildProcess<Buffer>)
    );

    mockedExeca.mockImplementationOnce(
      () =>
        ({
          stdout: 'non/ambiguous/dir/path/to/files/file1.js'
        } as unknown as ExecaChildProcess<Buffer>)
    );

    await expect(
      lib.fullname('non/ambiguous/dir/path/to/files/file1.js')
    ).resolves.toStrictEqual({
      ambiguous: false,
      file: 'non/ambiguous/dir/path/to/files/file1.js'
    });

    expect(mockedExeca).toBeCalledTimes(4);
  });

  it('returns { ambiguous: true, files: [...] } on ambiguous paths', async () => {
    expect.hasAssertions();

    mockedExeca.mockImplementationOnce(
      () =>
        ({
          stdout:
            'ambiguous/dir/path/to/files/file1.js\n' +
            'ambiguous/dir/path/to/files/file2.js\n' +
            'ambiguous/dir/to/file3.js'
        } as unknown as ExecaChildProcess<Buffer>)
    );

    mockedExeca.mockImplementationOnce(
      () =>
        ({
          stdout:
            'ambiguous/dir/path/to/files/file4.js\n' +
            'ambiguous/dir/path/to/files/file2.js\n' +
            'ambiguous/dir/path/to/files/file5.js\n' +
            'ambiguous/dir/to/file3.js'
        } as unknown as ExecaChildProcess<Buffer>)
    );

    await expect(lib.fullname('ambiguous/dir/path')).resolves.toStrictEqual({
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
      () => Promise.resolve({ stdout: '' }) as unknown as ExecaChildProcess<Buffer>
    );

    mockedExeca.mockImplementationOnce(
      () => Promise.resolve({ stdout: '' }) as unknown as ExecaChildProcess<Buffer>
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
