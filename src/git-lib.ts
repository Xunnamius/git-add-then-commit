import { name as pkgName } from 'package';
import debugFactory from 'debug';
import git from 'simple-git';
import ancestorPath from 'common-ancestor-path';
import execa from 'execa';

import type { TaskOptions } from 'simple-git';

const debug = debugFactory(`${pkgName}:git-lib`);

/**
 * The result of calling the `fullname()` function.
 */
export type FullnameResult =
  | { ambiguous: true; files: string[] }
  | { ambiguous: false; file: string };

/**
 * Returns all paths currently in the index whose indexed state differs from
 * HEAD. Similar to the result of `git status`.
 */
export async function getStagedPaths(): Promise<string[]> {
  const { files } = await git().status();
  const result = files
    .filter((f) => !['?', ' '].includes(f.index))
    .flatMap((f) => f.path.split(' -> '));

  debug('getStagedPaths: saw file paths: %O', files);
  debug('getStagedPaths: returning: %O', result);

  return result;
}

/**
 * Stage one or more paths with `git add`. If `paths` is an empty array, this
 * function becomes a no-op.
 */
export async function stagePaths(paths: string[]): Promise<void> {
  debug('stagePaths: adding (staging) paths: %O', paths);
  paths.length && (await git().add(paths));
}

/**
 * Create a commit from staged files. Throws if no commit object is created.
 * `pipeOutput=false` will silence the underlying child process; it is `true` by
 * default.
 */
export async function makeCommit(
  message: string,
  pipeOutput = true,
  noVerify: boolean | 'simple' = false
): Promise<void> {
  debug(`makeCommit: pipe output: ${pipeOutput}`);
  debug(`makeCommit: no-verify: ${noVerify}`);
  debug('makeCommit: creating commit with message: %O', message);

  const extraOpts: TaskOptions = noVerify === true ? ['--no-verify'] : [];

  // ? We use git directly here so we can inherit stdio for term color support
  await execa('git', ['commit', '-m', message, ...extraOpts], {
    ...(pipeOutput ? { stdio: 'inherit' } : { stdio: 'pipe' }),
    ...(noVerify === 'simple' ? { env: { GAC_VERIFY_SIMPLE: 'true' } } : {})
  }).catch(() => {
    throw new Error(`${pipeOutput ? '' : 'silent '}commit operation failed`);
  });
}

/**
 * Attempts to resolve an arbitrary `path` to a single full file path relative
 * to the repository root. If `path` resolves to no file, an error is thrown. If
 * `path` resolves to more than one file, `path` is considered "ambiguous" and
 * an array of files is returned.
 *
 * Note that this function expects all relevant paths to be tracked by git. If
 * `path` (or related files) are untracked, this function will either throw or
 * return something unexpected. In short: usually it's best to call
 * `stagePaths(paths)` before calling `fullname(paths[0])`.
 */
export async function fullname(path: string): Promise<FullnameResult> {
  const stdout = (
    await Promise.all([
      execa('git', ['diff', '--name-only', '--', path]),
      execa('git', ['diff', '--staged', '--name-only', '--', path])
    ])
  )
    .reduce((a, { stdout }) => [...a, ...stdout.split('\n')], [] as string[])
    .filter(Boolean);

  debug(`fullname: combined stdout array:\n"${stdout}"`);
  const files = Array.from(new Set(stdout));

  if (!files.length) throw new Error(`path "${path}" does not refer to any staged files`);

  const result: FullnameResult =
    files.length > 1 ? { ambiguous: true, files } : { ambiguous: false, file: files[0] };

  debug('fullname: computed files (from stdout): %O', files);
  debug('fullname: result: %O', result);
  return result;
}

/**
 * Find the non-root common ancestor of `paths` or return null.
 */
export function commonAncestor(paths: string[]): string | null {
  const ancestor = ancestorPath(...paths) || null;
  debug(`commonAncestor: computed ancestor: ${ancestor}`);
  return ancestor;
}

/**
 * Returns true only if the current working directory is a git repository.
 */
export async function isGitRepo(): Promise<boolean> {
  return git().checkIsRepo();
}

/**
 * Returns the absolute path of the root directory
 */
export async function getGitRepoRoot() {
  return execa('git', ['rev-parse', '--show-toplevel']).then((r) => r.stdout);
}
