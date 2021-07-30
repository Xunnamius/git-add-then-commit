/* eslint-disable jest/no-conditional-expect */
import { name as pkgName, bin as pkgBin } from '../package.json';
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

    expect(code).toBe(0);
    expect(stdout).toInclude('commit-type commit-scope commit-message');
  });
});

it('errors if called with bad args #1', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, [], { cwd: root });

    expect(code).toBe(1);
    expect(stderr).toInclude('must pass all required arguments');
  });
});

it('errors if called with bad args #2', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, ['file'], { cwd: root });

    expect(code).toBe(1);
    expect(stderr).toInclude('must pass all required arguments');
  });
});

it('errors if called with bad args #3', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, ['file', 'file'], { cwd: root });

    expect(code).toBe(1);
    expect(stderr).toInclude('must pass all required arguments');
  });
});

it('errors if called with bad args #4', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, ['--scope-omit'], { cwd: root });

    expect(code).toBe(1);
    expect(stderr).toInclude('must pass all required arguments');
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

    expect(code).toBe(1);
    expect(stderr).toInclude('only one scope option is allowed');
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

    expect(code).toBe(1);
    expect(stderr).toInclude('not a git repository');
  });
});

it('errors if called with nothing to commit #1', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stderr } = await run(CLI_BIN_PATH, ['type', 'scope', 'message'], {
      cwd: root
    });

    expect(code).toBe(1);
    expect(stderr).toInclude('stage a file or pass a path');
  });
});

it('errors if called with nothing to commit #2', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1').commit('test');
    await writeFile(`${root}/file1`, 'some-file-stuff');

    const { code, stderr } = await run(CLI_BIN_PATH, ['type', 'scope', 'message'], {
      cwd: root
    });

    expect(code).toBe(1);
    expect(stderr).toInclude('stage a file or pass a path');
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

    expect(code).toBe(1);
    expect(stdout).toBeEmpty();
    expect(stderr).toBeEmpty();
  });
});

it('errors if execution might clobber index (shallow, unambiguous)', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1');
    await writeFile(`${root}/file1`, 'new file contents');

    const { code, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'file1', 'fix', '-f', 'doomed add'],
      {
        cwd: root
      }
    );

    expect(code).toBe(1);
    expect(stderr).toInclude('"git add" could clobber index state');
  });
});

it('errors if execution might clobber index (deep, ambiguous)', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await Promise.all([
      writeFile(`${root}/path/to/file3`, 'new file contents'),
      writeFile(`${root}/path/to/file4`, 'new file contents')
    ]);
    await git.add(['path/to/file3', 'path/to/file4']);

    const { code, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'fix', '-f', 'doomed add'],
      {
        cwd: root
      }
    );

    expect(code).toBe(1);
    expect(stderr).toInclude('"git add" could clobber index state');
  });
});

it('does not error if execution might clobber index when done with --force', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1');
    await writeFile(`${root}/file1`, 'new file contents');

    const { code, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'file1', 'fix', '-f', 'doomed? add', '--force'],
      {
        cwd: root
      }
    );

    expect(code).toBe(0);
    expect(stderr).toBeEmpty();
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

    expect(code).toBe(0);
    expect(stdout).toBeEmpty();
    expect(stderr).toBeEmpty();
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

    expect(code).toBe(0);
    expect(stdout).not.toBeEmpty();
    expect(stderr).toBeEmpty();
  });
});

it('skips verification when --no-verify encountered', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    await writeFile(`${root}/.git/hooks/pre-commit`, '#!/bin/sh\nexit 1');
    await run('chmod', ['+x', `${root}/.git/hooks/pre-commit`]);

    let { code, stdout, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'type', 'scope', 'message', '--no-verify'],
      { cwd: root }
    );

    expect(code).toBe(1);
    expect(stdout).toBeEmpty();
    expect(stderr).not.toBeEmpty();

    ({ code, stdout, stderr } = await run(
      CLI_BIN_PATH,
      ['path', 'type', 'scope', 'message', '--no-verify'],
      { cwd: root }
    ));

    expect(code).toBe(0);
    expect(stdout).not.toBeEmpty();
    expect(stderr).toBeEmpty();
  });
});

it('--scope-basename errors with ambiguous first path arg', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    await writeFile(`${root}/path/to/file3`, 'some-file-stuff');

    const { code, stderr } = await run(CLI_BIN_PATH, ['path', 'type', '--', 'message'], {
      cwd: root
    });

    expect(code).toBe(1);
    expect(stderr).toInclude('ambiguous');
  });
});

it('--scope-basename works with single already-staged file', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1');
    await run(CLI_BIN_PATH, ['path', 'type', '--', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(file2): message');
    expect(commit).toInclude('a/path/to/file2');
  });
});

it('--scope-full works with non-ambiguous first path arg', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run(CLI_BIN_PATH, ['path', 'type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to/file2): message');
    expect(commit).toInclude('a/path/to/file2');
  });
});

it('--scope-full works with ambiguous first path arg with common ancestor', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/path/to/file3`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['path', 'type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to): message');
    expect(commit).toInclude('a/path/to/file2');
    expect(commit).toInclude('a/path/to/file3');
  });
});

it('--scope-full errors with staged paths with no common ancestor and with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/file3`, 'some-file-stuff');
    await git.add(['file1', 'file3']);

    const { code, stderr } = await run(CLI_BIN_PATH, ['type', '-f', 'message'], {
      cwd: root
    });

    expect(code).toBe(1);
    expect(stderr).toInclude('ambiguous');
  });
});

it('--scope-full works with staged paths with common ancestor with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/path/to/file3`, 'some-file-stuff');
    await git.add(['path/to/file2', 'path/to/file3']);

    await run(CLI_BIN_PATH, ['type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to): message');
    expect(commit).toInclude('a/path/to/file2');
    expect(commit).toInclude('a/path/to/file3');
  });
});

it('--scope-full works with single staged path with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add(['path/to/file2']);

    await run(CLI_BIN_PATH, ['type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path/to/file2): message');
    expect(commit).toInclude('a/path/to/file2');
  });
});

it('--scope-root works with non-ambiguous first path arg', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run(CLI_BIN_PATH, ['path', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path): message');
    expect(commit).toInclude('a/path/to/file2');
  });
});

it('--scope-root works with ambiguous first path arg with common ancestor', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/path/to/file3.json`, 'some-file-stuff');
    await run(CLI_BIN_PATH, ['path', 'type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path): message');
    expect(commit).toInclude('a/path/to/file2');
    expect(commit).toInclude('a/path/to/file3.json');
  });
});

it('--scope-root errors with staged paths with no common ancestor and with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/file3`, 'some-file-stuff');
    await git.add(['file1', 'file3']);

    const { code, stderr } = await run(CLI_BIN_PATH, ['type', '-r', 'message'], {
      cwd: root
    });

    expect(code).toBe(1);
    expect(stderr).toInclude('ambiguous');
  });
});

it('--scope-root works with staged paths with common ancestor with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/path/to/file3`, 'some-file-stuff');
    await git.add(['path/to/file2', 'path/to/file3']);

    await run(CLI_BIN_PATH, ['type', '---', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path): message');
    expect(commit).toInclude('a/path/to/file2');
    expect(commit).toInclude('a/path/to/file3');
  });
});

it('--scope-root works with single staged path with no path args', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/file3.json`, '{}');
    await git.add(['file3.json']);

    await run(CLI_BIN_PATH, ['type', '-r', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(file3): message');
    expect(commit).toInclude('a/file3.json');
  });
});

it('renames are committed properly', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('.');
    await git.commit('test: commit');
    await run('mv', ['file1', 'file3'], { cwd: root, reject: true });

    await run(CLI_BIN_PATH, ['file1', 'file3', 'fix', '--', 'rename to file3'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('fix(file1): rename to file3');
    expect(commit).toInclude('a/file1');
    expect(commit).toInclude('b/file3');
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
    expect(commit).toInclude('fix(file2): deleted');
    expect(commit).toInclude('a/path/to/file2');
  });
});

it('both staged and non-staged paths are added and committed properly', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await git.add('file1');
    await writeFile(`${root}/file1`, 'new file contents');

    await run(CLI_BIN_PATH, ['path', 'file1', 'fix', '-f', 'complex add', '--force'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('fix(path/to/file2): complex add');
    expect(commit).toInclude('a/file1');
    expect(commit).toInclude('a/path/to/file2');
    expect(await (await git.status()).isClean()).toBeTrue();
  });
});

it('still works when cwd is repo subdir', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['fake'], { cwd: root, reject: true });

    await run(CLI_BIN_PATH, ['../path', '../file1', 'fix', '-f', 'super complex add'], {
      cwd: `${root}/fake`,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('fix(path/to/file2): super complex add');
    expect(commit).toInclude('a/file1');
    expect(commit).toInclude('a/path/to/file2');
  });
});

it('--scope-basename derived scopes are lowercased', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'PATH2/TO'], { cwd: root, reject: true });
    await writeFile(`${root}/PATH2/TO/FILE3`, 'file3');

    await run(CLI_BIN_PATH, ['PATH2/TO/FILE3', 'type', '--', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(file3): message');
    expect(commit).toInclude('a/PATH2/TO/FILE3');
  });
});

it('--scope-full derived scopes are lowercased', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'PATH2/TO'], { cwd: root, reject: true });
    await writeFile(`${root}/PATH2/TO/FILE3`, 'file3');

    await run(CLI_BIN_PATH, ['PATH2/TO/FILE3', 'type', '-f', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path2/to/file3): message');
    expect(commit).toInclude('a/PATH2/TO/FILE3');
  });
});

it('--scope-root derived scopes are lowercased', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await run('mkdir', ['-p', 'PATH2/TO'], { cwd: root, reject: true });
    await writeFile(`${root}/PATH2/TO/FILE3`, 'file3');

    await run(CLI_BIN_PATH, ['PATH2/TO/FILE3', 'type', '-r', 'message'], {
      cwd: root,
      reject: true
    });

    const commit = await git.show();
    expect(commit).toInclude('type(path2): message');
    expect(commit).toInclude('a/PATH2/TO/FILE3');
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
    expect(commit).toInclude('a/path/to/file2');
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
    expect(commit).toInclude('type(file2)!: message');
    expect(commit).toInclude('a/path/to/file2');
  });

  await withMockedFixture(async ({ root, git }) => {
    if (!git) throw new Error('must use git-repository fixture');

    await writeFile(`${root}/path/to/file3`, 'some-file-stuff');
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
    expect(commit).toInclude('a/path/to/file2');
    expect(commit).toInclude('a/path/to/file3');
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
        expect(code).toBe(1);
        expect(stderr).toInclude('ambiguous');
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
