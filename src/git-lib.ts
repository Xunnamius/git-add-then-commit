import { name as pkgName } from '../package.json';
import debugFactory from 'debug';
import git from 'simple-git';
import ancestorPath from 'common-ancestor-path';
import execa from 'execa';

const debug = debugFactory(`${pkgName}:git-lib`);

export async function getStagedPaths(): Promise<string[]> {
  const { staged } = await git().status();
  debug('saw staged paths: %O', staged);
  return staged;
}

export async function stagePaths(paths: string[]): Promise<void> {
  debug('adding (staging) paths: %O', paths);
  paths.length ? await git().add(paths) : null;
}

export async function makeCommit(message: string): Promise<void> {
  debug('creating commit with message: %O', message);
  if (!(await git().commit(message)).commit) throw new Error('commit operation failed');
}

export type FullnameResult =
  | { ambiguous: true; files: string[] }
  | { ambiguous: false; file: string };

/**
 * Attempts to resolve an arbitrary path to a single full file path relative to
 * the repository root.
 *
 * Note that this function expects passed paths to be tracked. If said paths are
 * untracked, the result of this function is undefined. In short: call
 * `stagePaths(paths)` at some point before calling this function.
 */
export async function fullname(path: string): Promise<FullnameResult> {
  const { stdout, command } = await execa('git', [
    'ls-files',
    '--cached',
    '--full-name',
    path
  ]);

  debug(`executed command: ${command}`);
  debug(`stdout: "${stdout}"`);

  if (!stdout) throw new Error(`path "${path}" does not refer to any staged files`);

  const files = stdout.split('\n');
  const result: FullnameResult =
    files.length > 1 ? { ambiguous: true, files } : { ambiguous: false, file: files[0] };

  debug('computed files (from stdout): %O', files);
  debug('result: %O', result);
  return result;
}

// TODO: comments
export function commonAncestor(paths: string[]): string | null {
  const ancestor = ancestorPath(...paths) || null;
  debug(`computed ancestor: ${ancestor}`);
  return ancestor;
}

export async function isGitRepo(): Promise<boolean> {
  return git().checkIsRepo();
}
