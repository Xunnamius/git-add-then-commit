/* eslint-disable jest/no-conditional-expect */
import { name as pkgName, bin as pkgBin } from 'package';
import { promises as fs } from 'fs';
import fixtures from './fixtures';
import del from 'del';
import debugFactory from 'debug';

import {
  run,
  mockFixtureFactory,
  gitRepositoryFixture,
  dummyDirectoriesFixture,
  dummyFilesFixture
} from './setup';

import type { FixtureOptions } from './setup';

const TEST_IDENTIFIER = 'integration-client';
const CLI_BIN_PATH = `${__dirname}/../${pkgBin['git-add-then-commit']}`;

const { writeFile } = fs;
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);
const paths = Object.values(fixtures.meta.paths).flatMap((p) => p.actual);

// !!!!! XXX:
// TODO: XXX: ensure when given same directory to create multiple times that the
// TODO: XXX: operation is only performed once (optimization for Fixture pkg)
const fixtureOptions: Partial<FixtureOptions> = {
  directoryPaths: paths
    .filter((p) => p.includes('/'))
    .map((p) => p.split('/').slice(0, -1).join('/')),
  initialFileContents: paths.reduce((obj, path) => {
    // ? The file at `path` has contents equal to `path`
    obj[path] = path;
    return obj;
  }, {} as FixtureOptions['initialFileContents']),
  use: [dummyDirectoriesFixture(), dummyFilesFixture(), gitRepositoryFixture()]
};

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, fixtureOptions);

beforeAll(async () => {
  if ((await run('git', ['help'])).code != 0) {
    debug(`unable to find main distributable: ${CLI_BIN_PATH}`);
    throw new Error('must build distributables first (try `npm run build-dist`)');
  }

  if ((await run('test', ['-e', CLI_BIN_PATH])).code != 0) {
    debug(`unable to find main distributable: ${CLI_BIN_PATH}`);
    throw new Error('must build distributables first (try `npm run build-dist`)');
  }
});

it('executes when called directly (shebang test)', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stdout } = await run(CLI_BIN_PATH, ['--help'], { cwd: root });

    expect(stdout).toInclude('commit-type commit-scope commit-message');
    expect(code).toBe(0);
  });
});

it('errors if called with bad args #1', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, [], { cwd: root });

    expect(stderr).toInclude('must pass all required arguments');
    expect(code).toBe(1);
  });
});

it('errors if called with bad args #2', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, ['file'], { cwd: root });

    expect(stderr).toInclude('must pass all required arguments');
    expect(code).toBe(1);
  });
});

it('errors if called with bad args #3', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, ['file', 'file'], { cwd: root });

    expect(stderr).toInclude('must pass all required arguments');
    expect(code).toBe(1);
  });
});

it('errors if called with bad args #4', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, ['--scope-omit'], { cwd: root });

    expect(stderr).toInclude('must pass all required arguments');
    expect(code).toBe(1);
  });
});

it('errors if called with bad args #5', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(
      CLI_BIN_PATH,
      ['type', '--scope-omit', '--scope-basename', 'message'],
      { cwd: root }
    );

    expect(stderr).toInclude('only one scope option is allowed');
    expect(code).toBe(1);
  });
});

it('errors if called outside a git repo', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    await del(`${root}/.git`, { force: true });

    const { code, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'type', 'scope', 'message'],
      { cwd: root }
    );

    expect(stderr).toInclude('not a git repository');
    expect(code).toBe(1);
  });
});

it('errors if called with nothing to commit #1', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, ['type', 'scope', 'message'], {
      cwd: root
    });

    expect(stderr).toInclude('stage a file or pass a path');
    expect(code).toBe(1);
  });
});

it('errors if called with nothing to commit #2', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1.json').commit('test');
    await writeFile(`${root}/file1.json`, 'some-file-stuff');

    const { code, stderr } = await run(CLI_BIN_PATH, ['type', 'scope', 'message'], {
      cwd: root
    });

    expect(stderr).toInclude('stage a file or pass a path');
    expect(code).toBe(1);
  });
});

it('errors silently if called with --silent', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stdout, stderr } = await run(
      CLI_BIN_PATH,
      ['--silent', 'type', 'scope', 'message'],
      { cwd: root }
    );

    expect(stderr).toBeEmpty();
    expect(stdout).toBeEmpty();
    expect(code).toBe(1);
  });
});

it('errors if execution might clobber index (shallow, unambiguous)', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1.json');
    await writeFile(`${root}/file1.json`, 'new file contents');

    const { code, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'file1.json', 'fix', '-f', 'doomed add'],
      {
        cwd: root
      }
    );

    expect(stderr).toInclude('"git add" could clobber index state');
    expect(code).toBe(1);
  });
});

it('errors if execution might clobber index (deep, ambiguous)', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await Promise.all([
      writeFile(`${root}/path/to/file3.json`, 'new file contents'),
      writeFile(`${root}/path/to/file4.json`, 'new file contents')
    ]);
    await git.add(['path/to/file3.json', 'path/to/file4.json']);

    const { code, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'fix', '-f', 'doomed add'],
      {
        cwd: root
      }
    );

    expect(stderr).toInclude('"git add" could clobber index state');
    expect(code).toBe(1);
  });
});

it('does not error if execution might clobber index when done with --force', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1.json');
    await writeFile(`${root}/file1.json`, 'new file contents');

    const { code, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'file1.json', 'fix', '-f', 'doomed? add', '--force'],
      {
        cwd: root
      }
    );

    expect(stderr).toBeEmpty();
    expect(code).toBe(0);
  });
});

it('commits silently if called with --silent', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stdout, stderr } = await run(
      CLI_BIN_PATH,
      ['--silent', 'path', 'type', 'scope', 'message'],
      { cwd: root }
    );

    expect(stderr).toBeEmpty();
    expect(stdout).toBeEmpty();
    expect(code).toBe(0);
  });
});

it('commits verbosely if not called with --silent', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stdout, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'type', 'scope', 'message'],
      { cwd: root }
    );

    expect(stderr).toBeEmpty();
    expect(stdout).not.toBeEmpty();
    expect(code).toBe(0);
  });
});

it('skips verification when --no-verify encountered', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    await writeFile(`${root}/.git/hooks/pre-commit`, '#!/bin/sh\nexit 1');
    await run('chmod', ['+x', `${root}/.git/hooks/pre-commit`]);

    let { code, stdout, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'type', 'scope', 'message'],
      { cwd: root }
    );

    expect(stderr).not.toBeEmpty();
    expect(stdout).toBeEmpty();
    expect(code).toBe(1);

    await run('git', ['reset'], { cwd: root, reject: true });

    ({ code, stdout, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'type', 'scope', 'message', '--no-verify'],
      { cwd: root }
    ));

    expect(stderr).toBeEmpty();
    expect(stdout).not.toBeEmpty();
    expect(code).toBe(0);
  });
});

it('--scope-basename errors with ambiguous first path', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    await writeFile(`${root}/path/to/file3.json`, 'some-file-stuff');

    const { code, stderr } = await run(CLI_BIN_PATH, ['path', 'type', '--', 'message'], {
      cwd: root
    });

    expect(stderr).toInclude('ambiguous');
    expect(code).toBe(1);
  });
});

it('--scope-basename works with non-ambiguous staged file', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1.json');
    await run(CLI_BIN_PATH, ['path', 'type', '--', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(file2.json): message');
    expect(commit).toInclude('a/path/to/file2.json');
  });
});

it('--scope-full works with non-ambiguous first path with and without file extension', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run(CLI_BIN_PATH, ['path', 'type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to/file2.json): message');
    expect(commit).toInclude('a/path/to/file2.json');
  });

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mv', [`${root}/path/to/file2.json`, `${root}/path/to/file3`], {
      cwd: root,
      reject: true
    });

    await run(CLI_BIN_PATH, ['path', 'type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to/file3): message');
    expect(commit).toInclude('a/path/to/file3');
  });
});

it('--scope-full works with ambiguous first path with common ancestor', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/path/to/file3.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['path', 'type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to): message');
    expect(commit).toInclude('a/path/to/file2.json');
    expect(commit).toInclude('a/path/to/file3.json');
  });
});

it('--scope-full works with staged paths with common ancestor with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/path/to/file3.json`, 'some-file-stuff');
    await git.add(['path/to/file2.json', 'path/to/file3.json']);

    await run(CLI_BIN_PATH, ['type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to): message');
    expect(commit).toInclude('a/path/to/file2.json');
    expect(commit).toInclude('a/path/to/file3.json');
  });
});

it('--scope-full works with non-ambiguous staged path with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add(['path/to/file2.json']);

    await run(CLI_BIN_PATH, ['type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to/file2.json): message');
    expect(commit).toInclude('a/path/to/file2.json');
  });
});

it('--scope-full works with staged paths and path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add(['path/to/file2.json']);

    await run(CLI_BIN_PATH, ['type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to/file2.json): message');
    expect(commit).toInclude('a/path/to/file2.json');
  });
});

it('--scope-full errors with staged paths with no common ancestor and with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/file3.json`, 'some-file-stuff');
    await git.add(['file1.json', 'file3.json']);

    const { code, stderr } = await run(CLI_BIN_PATH, ['type', '-f', 'message'], {
      cwd: root
    });

    expect(stderr).toInclude('ambiguous');
    expect(code).toBe(1);
  });
});

it('--scope-root works with non-ambiguous non-index path using 1st directory', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run(CLI_BIN_PATH, ['path', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path): message');
    expect(commit).toInclude('a/path/to/file2.json');
  });
});

it('--scope-root works with non-ambiguous index path with and without file extension', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'path2'], { cwd: root, reject: true });
    await writeFile(`${root}/path2/index.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['path2', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path2): message');
    expect(commit).toInclude('a/path2/index.json');
  });

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'path2'], { cwd: root, reject: true });
    await writeFile(`${root}/path2/index`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['path2', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path2): message');
    expect(commit).toInclude('a/path2/index');
  });
});

it('--scope-root works with non-ambiguous index path at root', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/index.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['index.json', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(index): message');
    expect(commit).toInclude('a/index.json');
  });
});

it('--scope-root works with various dot paths', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/index.index.index.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['index.index.index.json', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(index): message');
    expect(commit).toInclude('a/index.index.index.json');
  });

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'indx.ndx'], { cwd: root, reject: true });
    await writeFile(`${root}/indx.ndx/index.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['indx.ndx/index.json', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(indx): message');
    expect(commit).toInclude('a/indx.ndx/index.json');
  });

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'type/indx.ndx'], { cwd: root, reject: true });
    await writeFile(`${root}/type/indx.ndx/index.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['type/indx.ndx/index.json', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(indx): message');
    expect(commit).toInclude('a/type/indx.ndx/index.json');
  });
});

it('--scope-root works with non-ambiguous non-index path with matching 1st directory and non-matching 2nd directory', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'type/to'], { cwd: root, reject: true });
    await writeFile(`${root}/type/to/file.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['type', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(to): message');
    expect(commit).toInclude('a/type/to/file.json');
  });
});

it('--scope-root works with non-ambiguous non-index path with matching 1st directory and no 2nd directory', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'first-dir/another'], { cwd: root, reject: true });
    await writeFile(`${root}/first-dir/file.json`, 'some-file-stuff');
    await writeFile(`${root}/first-dir/another/file`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['first-dir', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(first-dir): message');
    expect(commit).toInclude('a/first-dir/file.json');
    expect(commit).toInclude('a/first-dir/another/file');
  });
});

it('--scope-root omits scope with non-ambiguous index path with matching 1st directory and no 2nd directory', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'type'], { cwd: root, reject: true });
    await writeFile(`${root}/type/index.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['type', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type: message');
    expect(commit).toInclude('a/type/index.json');
  });

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'type'], { cwd: root, reject: true });
    await writeFile(`${root}/type/index`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['type', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type: message');
    expect(commit).toInclude('a/type/index');
  });
});

it('--scope-root omits scope with non-ambiguous non-index path with matching 1st directory and a matching 2nd directory', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'type/type'], { cwd: root, reject: true });
    await writeFile(`${root}/type/type/file1.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['type', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type: message');
    expect(commit).toInclude('a/type/type/file1.json');
  });
});

it('--scope-root omits scope with ambiguous index path with common ancestor with first and 2nd directory matching', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'type/type/another'], { cwd: root, reject: true });
    await writeFile(`${root}/type/type/index.json`, 'some-file-stuff');
    await writeFile(`${root}/type/type/another/index`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['type', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type: message');
    expect(commit).toInclude('a/type/type/index.json');
    expect(commit).toInclude('a/type/type/another/index');
  });
});

it('--scope-root works with non-ambiguous staged path with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/file3.json`, '{}');
    await git.add(['file3.json']);

    await run(CLI_BIN_PATH, ['type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(file3): message');
    expect(commit).toInclude('a/file3.json');
  });
});

it('--scope-root works with non-ambiguous staged path with path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/file3.json`, '{}');
    await git.add(['path']);

    await run(CLI_BIN_PATH, ['file3.json', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(file3): message');
    expect(commit).toInclude('a/path');
    expect(commit).toInclude('a/file3.json');
  });
});

it('--scope-root errors with ambiguous root staged paths with no common ancestor', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/index.json`, 'some-file-stuff');
    await git.add(['file1.json', 'index.json']);

    const { code, stderr } = await run(CLI_BIN_PATH, ['type', '---', 'message'], {
      cwd: root
    });

    expect(stderr).toInclude('ambiguous');
    expect(code).toBe(1);
  });
});

it('renames are committed properly', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('.');
    await git.commit('test: commit');
    await run('mv', ['file1.json', 'file3.json'], { cwd: root, reject: true });

    await run(
      CLI_BIN_PATH,
      ['file1.json', 'file3.json', 'fix', '--', 'rename to file3.json'],
      {
        cwd: root,
        reject: true
      }
    );

    const commit = await git.show();
    expect(commit).toInclude('fix(file1.json): rename to file3.json');
    expect(commit).toInclude('a/file1.json');
    expect(commit).toInclude('b/file3.json');
  });
});

it('deleted paths are committed properly', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('.');
    await git.commit('test: commit');
    await del(`${root}/path`, { force: true });

    await run(CLI_BIN_PATH, ['path', 'fix', '--', 'deleted'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('fix(file2.json): deleted');
    expect(commit).toInclude('a/path/to/file2.json');
  });
});

it('both staged and non-staged paths are added and committed properly', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1.json');
    await writeFile(`${root}/file1.json`, 'new file contents');

    await run(
      CLI_BIN_PATH,
      ['path', 'file1.json', 'fix', '-f', 'complex add', '--force'],
      {
        cwd: root,
        reject: true
      }
    );

    const commit = await git.show();
    expect(commit).toInclude('fix(path/to/file2.json): complex add');
    expect(commit).toInclude('a/file1.json');
    expect(commit).toInclude('a/path/to/file2.json');
    expect(await (await git.status()).isClean()).toBeTrue();
  });
});

it('still works when cwd is repo subdir', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['fake'], { cwd: root, reject: true });

    await run(
      CLI_BIN_PATH,
      ['../path', '../file1.json', 'fix', '-f', 'super complex add'],
      {
        cwd: `${root}/fake`,
        reject: true
      }
    );

    const commit = await git.show();
    expect(commit).toInclude('fix(path/to/file2.json): super complex add');
    expect(commit).toInclude('a/file1.json');
    expect(commit).toInclude('a/path/to/file2.json');
  });
});

it('--scope-basename derived scopes are lowercased', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'PATH2/TO'], { cwd: root, reject: true });
    await writeFile(`${root}/PATH2/TO/FILE3.json`, 'file3.json');

    await run(CLI_BIN_PATH, ['PATH2/TO/FILE3.json', 'type', '--', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(file3.json): message');
    expect(commit).toInclude('a/PATH2/TO/FILE3.json');
  });
});

it('--scope-full derived scopes are lowercased', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'PATH2/TO'], { cwd: root, reject: true });
    await writeFile(`${root}/PATH2/TO/FILE3.json`, 'file3.json');

    await run(CLI_BIN_PATH, ['PATH2/TO/FILE3.json', 'type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path2/to/file3.json): message');
    expect(commit).toInclude('a/PATH2/TO/FILE3.json');
  });
});

it('--scope-root derived scopes are lowercased', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'PATH2/TO'], { cwd: root, reject: true });
    await writeFile(`${root}/PATH2/TO/FILE3.json`, 'file3.json');

    await run(CLI_BIN_PATH, ['PATH2/TO/FILE3.json', 'type', '-r', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path2): message');
    expect(commit).toInclude('a/PATH2/TO/FILE3.json');
  });
});

it('exclamation-colon used when breaking change text encountered in commit message', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run(CLI_BIN_PATH, ['path', 'type', '-', 'message\n\nBREAKING: change'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type!: message');
    expect(commit).toInclude('a/path/to/file2.json');
  });

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run(
      CLI_BIN_PATH,
      ['path', 'type', '--', 'message\n\nBREAKING CHANGE: change'],
      {
        cwd: root,
        reject: true
      }
    );

    const commit = await git.show();
    expect(commit).toInclude('type(file2.json)!: message');
    expect(commit).toInclude('a/path/to/file2.json');
  });

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/path/to/file3.json`, 'some-file-stuff');
    await run(
      CLI_BIN_PATH,
      ['path', 'type', '-r', 'message\n\nBREAKING CHANGES: change'],
      {
        cwd: root,
        reject: true
      }
    );

    const commit = await git.show();
    expect(commit).toInclude('type(path)!: message');
    expect(commit).toInclude('a/path/to/file2.json');
    expect(commit).toInclude('a/path/to/file3.json');
  });
});

it('readme --scope-full and --scope-root examples work', async () => {
  expect.hasAssertions();

  // ? --scope-full
  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('rm', ['-rf', 'path'], { cwd: root, reject: true });
    await run('mkdir', ['-p', 'public/images', 'src/interface', 'test/fixtures'], {
      cwd: root,
      reject: true
    });

    await writeFile(`${root}/public/images/favicon.ico`, 'file-stuff');
    await writeFile(`${root}/src/index.ts`, 'file-stuff');
    await writeFile(`${root}/src/interface/cli.ts`, 'file-stuff');
    await writeFile(`${root}/test/fixtures/dummy-1.ts`, 'file-stuff');
    await writeFile(`${root}/test/fixtures/dummy-2.ts`, 'file-stuff');

    await run(CLI_BIN_PATH, ['src', 'feat', '--scope-full', 'add new killer feature'], {
      cwd: root,
      reject: true
    });

    let commit = await git.show();
    expect(commit).toInclude('feat(src): add new killer feature');
    expect(commit).toInclude('a/src/index.ts');
    expect(commit).toInclude('a/src/interface/cli.ts');

    await run(
      CLI_BIN_PATH,
      ['test', 'refactor', '--scope-full', 'update tests for new feature'],
      {
        cwd: root,
        reject: true
      }
    );

    commit = await git.show();
    expect(commit).toInclude('refactor(test/fixtures): update tests for new feature');
    expect(commit).toInclude('a/test/fixtures/dummy-1.ts');
    expect(commit).toInclude('a/test/fixtures/dummy-2.ts');

    await run(CLI_BIN_PATH, ['public', 'style', '--scope-full', 'new favicon'], {
      cwd: root,
      reject: true
    });

    commit = await git.show();
    expect(commit).toInclude('style(public/images/favicon.ico): new favicon');
    expect(commit).toInclude('a/public');
  });

  // ? --scope-root
  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('rm', ['-rf', 'path'], { cwd: root, reject: true });
    await run('mkdir', ['-p', 'docs', 'lib/api', 'test/integrations'], {
      cwd: root,
      reject: true
    });

    await writeFile(`${root}/CHANGELOG.md`, 'file-stuff');
    await writeFile(`${root}/docs/supplementary.md`, 'file-stuff');
    await writeFile(`${root}/docs/README.md`, 'file-stuff');
    await writeFile(`${root}/index.ts`, 'file-stuff');
    await writeFile(`${root}/lib/api/adapter.ts`, 'file-stuff');
    await writeFile(`${root}/lib/index.ts`, 'file-stuff');
    await writeFile(`${root}/lib/cli.ts`, 'file-stuff');
    await writeFile(`${root}/package.json`, 'file-stuff');
    await writeFile(`${root}/package-lock.json`, 'file-stuff');
    await writeFile(`${root}/test/index.ts`, 'file-stuff');
    await writeFile(`${root}/test/units.ts`, 'file-stuff');
    await writeFile(`${root}/test/integrations/e2e-tests.ts`, 'file-stuff');
    await writeFile(`${root}/test/integrations/index.ts`, 'file-stuff');

    await run(CLI_BIN_PATH, ['lib/index.ts', 'fix', '---', 'fix bug that caused crash'], {
      cwd: root,
      reject: true
    });

    let commit = await git.show();
    expect(commit).toInclude('fix(lib): fix bug that caused crash');
    expect(commit).toInclude('a/lib/index.ts');

    await run(
      CLI_BIN_PATH,
      ['lib/api', 'refactor', '---', 'use updated mongodb native driver'],
      {
        cwd: root,
        reject: true
      }
    );

    commit = await git.show();
    expect(commit).toInclude('refactor(lib): use updated mongodb native driver');
    expect(commit).toInclude('a/lib/api/adapter.ts');

    await run(
      CLI_BIN_PATH,
      ['package.json', 'package-lock.json', 'chore', '---', 'update dependencies'],
      {
        cwd: root,
        reject: true
      }
    );

    commit = await git.show();
    expect(commit).toInclude('chore(package): update dependencies');
    expect(commit).toInclude('a/package.json');
    expect(commit).toInclude('a/package-lock.json');

    await git.add('docs');
    await run(CLI_BIN_PATH, ['docs', '---', 'add sections on new killer feature'], {
      cwd: root,
      reject: true
    });

    commit = await git.show();
    expect(commit).toInclude('docs: add sections on new killer feature');
    expect(commit).toInclude('a/docs');

    await run(
      CLI_BIN_PATH,
      ['test/integrations/index.ts', 'test', '---', 'update integration tests'],
      {
        cwd: root,
        reject: true
      }
    );

    commit = await git.show();
    expect(commit).toInclude('test(integrations): update integration tests');
    expect(commit).toInclude('a/test/integrations/index.ts');

    await run(
      CLI_BIN_PATH,
      ['test/integrations', 'style', '---', 'use emojis in all TODO comments'],
      {
        cwd: root,
        reject: true
      }
    );

    commit = await git.show();
    expect(commit).toInclude('style(test): use emojis in all TODO comments');
    expect(commit).toInclude('a/test/integrations/e2e-tests.ts');

    await run(
      CLI_BIN_PATH,
      ['test/index.ts', 'test', '---', 'update tooling to use latest features'],
      {
        cwd: root,
        reject: true
      }
    );

    commit = await git.show();
    expect(commit).toInclude('test: update tooling to use latest features');
    expect(commit).toInclude('a/test/index.ts');

    await run(
      CLI_BIN_PATH,
      ['test', 'test', '---', 'add unit tests for new killer feature'],
      {
        cwd: root,
        reject: true
      }
    );

    commit = await git.show();
    expect(commit).toInclude('test(units): add unit tests for new killer feature');
    expect(commit).toInclude('a/test/units.ts');

    await run(
      CLI_BIN_PATH,
      ['index.ts', 'lib/cli.ts', 'feat', '---', 'add new killer feature'],
      {
        cwd: root,
        reject: true
      }
    );

    commit = await git.show();
    expect(commit).toInclude('feat(index): add new killer feature');
    expect(commit).toInclude('a/index.ts');
    expect(commit).toInclude('a/lib/cli.ts');

    await run(CLI_BIN_PATH, ['CHANGELOG.md', 'docs', '---', 'regenerate'], {
      cwd: root,
      reject: true
    });

    commit = await git.show();
    expect(commit).toInclude('docs(changelog): regenerate');
    expect(commit).toInclude('a/CHANGELOG.md');
  });
});

fixtures.forEach((test) => {
  const [argName] = Object.entries(test.commitArgs).find(([_, v]) => Boolean(v)) || [
    '(none)'
  ];

  it(// eslint-disable-next-line jest/valid-title
  `stages and commits:: pre-staged: ${test.preStagedPaths.length} added: ${
    test.stagePaths.length
  } scope-arg: ${argName} first-arg: ${
    test.stagePaths.length
      ? test.programArgs[0]
      : test.preStagedPaths[0] + ' (pre-staged)'
  }${test.titleSuffix ? ' [' + test.titleSuffix + ']' : ''}`, async () => {
    expect.hasAssertions();

    await withMockedFixture(async ({ root, git }) => {
      if (!git) throw new Error('must use git-repository fixture');

      await git.add(test.preStagedPaths);
      const { code, stderr } = await run(CLI_BIN_PATH, [...test.programArgs, '--force'], {
        cwd: root
      });

      if (
        !test.passedPaths.length &&
        ['scopeFull', 'scopeRoot', 'scopeBasename', 'scopeAsIs'].includes(argName)
      ) {
        expect(stderr).toInclude('ambiguous');
        expect(code).toBe(1);
      } else {
        expect(code).toBe(0);
        const commit = await git.show();
        expect(commit).toInclude(test.commitMessage);
        [...test.stagePaths, ...test.preStagedPaths].forEach((p) =>
          expect(commit).toInclude(`a/${p}`)
        );
      }
    });
  });
});
