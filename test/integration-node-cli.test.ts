import { name as pkgName, version as pkgVersion, bin as pkgBin } from '../package.json';
import sjx from 'shelljs';
import debugFactory from 'debug';
import uniqueFilename from 'unique-filename';
import del from 'del';
import fixtures from './fixtures';
import gitFactory from 'simple-git';

const TEST_IDENTIFIER = 'integration-node-cli';
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);
const gac = `${__dirname}/../${pkgBin['git-add-then-commit']}`;

sjx.config.silent = !process.env.DEBUG;

if (sjx.exec('git help', { silent: true }).code !== 0)
  throw new Error('git must be installed and in PATH to run this test suite');

if (!sjx.test('-d', './dist')) {
  debug(`unable to find main distributables dir: ${sjx.pwd()}/dist`);
  throw new Error(
    'must build distributables before running this test suite (try `npm run build-dist`)'
  );
}

debug(`pkgName: "${pkgName}"`);
debug(`pkgVersion: "${pkgVersion}"`);

let deleteRoot: () => Promise<void>;
let git: ReturnType<typeof gitFactory>;

beforeEach(async () => {
  const paths = Object.values(fixtures.meta.paths).flatMap((p) => p.actual);
  const root = uniqueFilename(sjx.tempdir(), TEST_IDENTIFIER);
  const owd = process.cwd();

  deleteRoot = async () => {
    sjx.cd(owd);
    debug(`forcibly removing dir ${root}`);
    await del(root, { force: true });
  };

  sjx.mkdir('-p', root);

  paths
    .filter((p) => p.includes('/'))
    .map((p) => p.split('/').slice(0, -1).join('/'))
    .forEach((p) => sjx.mkdir('-p', `${root}/${p}`));

  const cd = sjx.cd(root);

  if (cd.code != 0) {
    await deleteRoot();
    throw new Error(`failed to mkdir/cd into ${root}: ${cd.stderr} ${cd.stdout}`);
  } else debug(`created temp root dir: ${root}`);

  paths
    .map((p) => [p, p.split('/').slice(-1)[0]])
    .forEach(([p, f]) => new sjx.ShellString(f).to(`${root}/${p}`));

  git = gitFactory();
  await git
    .init()
    .addConfig('user.name', 'fake-user')
    .addConfig('user.email', 'fake@email');

  debug(`directory at this point: ${sjx.exec('tree -a', { silent: true }).stdout}`);
});

afterEach(() => deleteRoot());

describe(`${pkgName} [${TEST_IDENTIFIER}]`, () => {
  it('--scope-basename functions as expected under case #1', async () => {
    expect.hasAssertions();

    // * Testing ambiguous first path arg
    const cmd = `node ${gac} path type -- message`;

    new sjx.ShellString('f').to(`${sjx.pwd()}/path/to/file3`);
    debug(`running command: "${cmd}"`);
    const { code, stderr } = sjx.exec(cmd);

    expect(code).toBe(1);
    expect(stderr).toInclude('ambiguous');
  });

  it('--scope-basename functions as expected under case #2', async () => {
    expect.hasAssertions();

    // * Testing with single already-staged file
    const cmd = `node ${gac} path type -- message`;

    await git.add('file1');
    debug(`running command: "${cmd}"`);

    expect(sjx.exec(cmd).code).toBe(0);
    expect(await git.show()).toInclude('type(file2): message');
  });

  it('--scope-full functions as expected under case #1', async () => {
    expect.hasAssertions();

    // * Testing non-ambiguous first path arg
    const cmd = `node ${gac} path type -f message`;

    debug(`running command: "${cmd}"`);

    expect(sjx.exec(cmd).code).toBe(0);
    expect(await git.show()).toInclude('type(path/to/file2): message');
  });

  it('--scope-full functions as expected under case #2', async () => {
    expect.hasAssertions();

    // * Testing ambiguous first path arg with common ancestor
    const cmd = `node ${gac} path type -f message`;

    new sjx.ShellString('f').to(`${sjx.pwd()}/path/to/file3`);
    debug(`running command: "${cmd}"`);

    expect(sjx.exec(cmd).code).toBe(0);
    expect(await git.show()).toInclude('type(path/to): message');
  });

  it('--scope-full functions as expected under case #3', async () => {
    expect.hasAssertions();

    // * Testing staged paths with no common ancestor and with no path args
    const cmd = `node ${gac} type -f message`;

    new sjx.ShellString('f').to(`${sjx.pwd()}/file3`);
    await git.add(['file1', 'file3']);
    debug(`running command: "${cmd}"`);
    const { code, stderr } = sjx.exec(cmd);

    expect(code).toBe(1);
    expect(stderr).toInclude('ambiguous');
  });

  it('--scope-full functions as expected under case #4', async () => {
    expect.hasAssertions();

    // * Testing staged paths with common ancestor with no path args
    const cmd = `node ${gac} type -f message`;

    new sjx.ShellString('f').to(`${sjx.pwd()}/path/to/file3`);
    await git.add(['path/to/file2', 'path/to/file3']);
    debug(`running command: "${cmd}"`);

    expect(sjx.exec(cmd).code).toBe(0);
    expect(await git.show()).toInclude('type(path/to): message');
  });

  it('--scope-full functions as expected under case #5', async () => {
    expect.hasAssertions();

    // * Testing single staged path with no path args
    const cmd = `node ${gac} type -f message`;

    await git.add(['path/to/file2']);
    debug(`running command: "${cmd}"`);

    expect(sjx.exec(cmd).code).toBe(0);
    expect(await git.show()).toInclude('type(path/to/file2): message');
  });

  it('errors if called outside a git repo', async () => {
    expect.hasAssertions();

    const cmd = `node ${gac} path type scope message`;

    await del('.git');
    debug(`running command: "${cmd}"`);
    const { code, stderr } = sjx.exec(cmd);

    expect(code).toBe(1);
    expect(stderr).toInclude('not a git repository');
  });

  it('errors if called with nothing to commit', async () => {
    expect.hasAssertions();

    const cmd = `node ${gac} type scope message`;

    debug(`running command: "${cmd}"`);
    const { code, stderr } = sjx.exec(cmd);

    expect(code).toBe(1);
    expect(stderr).toInclude('stage a file or pass a path');
  });

  it('errors silently if called with --silent', async () => {
    expect.hasAssertions();

    const cmd = `node ${gac} --silent type scope message`;

    debug(`running command: "${cmd}"`);
    const { code, stdout, stderr } = sjx.exec(cmd);

    expect(code).toBe(1);
    expect(stdout).toBeEmpty();
    expect(stderr).toBeEmpty();
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
      await git.add(test.preStagedPaths);

      // ? Converts every arg in program args into "arg"
      const cmd = `node ${gac} ` + test.programArgs.map((a) => `"${a}"`).join(' ');
      debug(`running command: "${cmd}"`);

      if (
        !test.passedPaths.length &&
        ['scopeFull', 'scopeBasename', 'scopeAsIs'].includes(argName)
      ) {
        const { code, stderr } = sjx.exec(cmd);
        // eslint-disable-next-line jest/no-conditional-expect
        expect(code).toBe(1);
        // eslint-disable-next-line jest/no-conditional-expect
        expect(stderr).toInclude('ambiguous');
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(sjx.exec(cmd).code).toBe(0);
        // eslint-disable-next-line jest/no-conditional-expect
        expect(await git.show()).toInclude(test.commitMessage);
      }
    });
  });
});
