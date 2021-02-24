import { name as pkgName } from '../package.json';
import {
  getStagedPaths,
  makeCommit,
  stagePaths,
  fullname,
  isGitRepo,
  commonAncestor
} from './git-lib';
import { basename } from 'path';
import yargs from 'yargs/yargs';
import debugFactory from 'debug';

import type { Arguments, Argv } from 'yargs';

export type Program = Argv;
export type { Arguments };
export type Parser = (argv?: string[]) => Promise<Arguments>;

export type Context = {
  program: Program;
  parse: Parser;
};

const debug = debugFactory(`${pkgName}:index`);

/**
 * Create and return a pre-configured Yargs instance (program) and argv parser.
 */
export function configureProgram(): Context;
/**
 * Configure an existing Yargs instance (program) and return an argv parser.
 *
 * @param program A Yargs instance to configure
 */
export function configureProgram(program: Program): Context;
export function configureProgram(program?: Program): Context {
  const finalProgram = program || yargs();

  finalProgram
    .scriptName('gac')
    .usage(
      '$0 [path1, path2, ...] commit-type commit-scope commit-message' +
        '\n\nStage any paths provided and then commit all staged files. ' +
        'Running this command is equivalent to running the following git commands by hand:' +
        '\n  git add path1 path2 ...' +
        '\n  git commit -m "commit-type(commit-scope): commit-message"'
    )
    .options({
      'scope-omit': {
        alias: 'o',
        describe: 'Do not include a scope at all',
        type: 'boolean'
      },
      'scope-basename': {
        alias: 'b',
        describe: "Use path1's basename as the scope",
        type: 'boolean'
      },
      'scope-as-is': {
        alias: 'a',
        describe: 'Use path1 exactly as typed as the scope',
        type: 'boolean'
      },
      'scope-full': {
        alias: 'f',
        describe: 'Use path1 (relative to repo root) as the scope',
        type: 'boolean'
      },
      silent: {
        alias: 's',
        describe: 'Nothing will be printed to stdout or stderr',
        type: 'boolean'
      }
    })
    .string('_')
    .group(
      ['scope-omit', 'scope-basename', 'scope-as-is', 'scope-full'],
      'Scope options:'
    )
    .group(['help', 'version', 'silent'], 'Other options:')
    .epilogue(
      'Details:' +
        '\n  The commit-scope parameter must be omitted when specifying a scope option. Specifying more than one scope option will fail. Special scope options - and -- alias -o and -b respectively.' +
        '\n\n  If no path arguments are passed, -a will fail. If no path arguments are passed and there is not exactly one staged file, -b will fail. If no path arguments are passed, -f will return the full path if there is exactly one staged file, the deepest common ancestor of all staged files if there is more than one, or fail if there is no non-root common ancestor. If path1 is ambiguous, -f will return the deepest common ancestor.'
    )
    .example([
      [
        '$0 path/to/file1 feat - "new feature"',
        'Stages file1 & commits as "feat: new feature"'
      ],
      [
        '$0 path file2 feat -- "new feature"',
        'Stages file1 & file2 & commits as "feat(file1): new feature"'
      ],
      [
        '$0 path feat --scope-as-is "feature"',
        'Stages file1 & commits as "feat(path): feature"'
      ],
      [
        '$0 path feat --scope-full "new feature"',
        'Stages file1 & commits as "feat(path/to/file1): new feature"'
      ],
      [
        '$0 chore scripts "update var names"',
        'Commits (all staged files) as "chore(scripts): update var names"'
      ]
    ])
    .strictOptions();

  return {
    program: finalProgram,
    parse: async (argv?: string[]) => {
      argv = (argv?.length ? argv : process.argv.slice(2)).map((a) =>
        a == '-' ? '-o' : a == '--' ? '-b' : a
      );

      debug('parse: saw argv: %O', argv);
      const finalArgv = finalProgram.parse(argv);

      let shouldDeriveScope = false;
      const opCount = ['scopeOmit', 'scopeBasename', 'scopeAsIs', 'scopeFull'].filter(
        (a) => a in finalArgv
      ).length;
      const minArgCount = !!(shouldDeriveScope = !!opCount) ? 2 : 3;

      if (opCount > 1)
        throw new Error('only one scope option is allowed. See --help for details');

      if (finalArgv._.length < minArgCount)
        throw new Error('must pass all required arguments. See --help for details');

      if (!(await isGitRepo()))
        throw new Error('not a git repository (or any of the parent directories): .git');

      const preStagedPaths = await getStagedPaths();
      debug('parse: pre-staged paths: %O', preStagedPaths);

      if (finalArgv._.length == minArgCount && !preStagedPaths.length)
        throw new Error('must stage a file or pass a path. See --help for details');

      const params = Array.from(finalArgv._).map(String);
      const passedPaths = params.splice(0, params.length - (shouldDeriveScope ? 2 : 3));
      const [commitType, commitScope, commitMessage] = shouldDeriveScope
        ? // eslint-disable-next-line no-sparse-arrays
          [params[0], , params[1]]
        : params;

      let message = `${commitType}(${commitScope}): ${commitMessage}`;

      await stagePaths(newPaths);

      // * This check may not be necessary if stagePaths always throws on error
      const latestStagedPaths = await getStagedPaths();
      if (!latestStagedPaths.length) throw new Error('assert failed: nothing to commit');

      if (!commitScope) {
        debug('parse: deriving commit scope based on rules: %O', finalArgv);

        if (finalArgv.scopeOmit) {
          debug('deriving as omit');
          message = `${commitType}: ${commitMessage}`;
        } else {
          let computedScope: string;

          if (finalArgv.scopeBasename) {
            debug('deriving as basename');

            if (passedPaths.length) {
              const firstPath = passedPaths[0];
              const result = await fullname(firstPath);

              if (result.ambiguous)
                throw new Error('use of --scope-basename with an ambiguous path');

              computedScope = basename(result.file);
            } else {
              // staged.length == 0 is impossible b/c yargs check() validation
              if (latestStagedPaths.length == 1)
                computedScope = basename(latestStagedPaths[0]);
              else {
                throw new Error(
                  'use of --scope-basename with multiple staged files is ambiguous'
                );
              }
            }

            computedScope = computedScope.toLowerCase();
          } else if (finalArgv.scopeFull) {
            debug('deriving as full');

            const getAncestor = (files: string[]) => {
              const ancestor = commonAncestor(files);
              if (!ancestor) {
                throw new Error(
                  'use of --scope-full is ambiguous without common non-root ancestor path'
                );
              }
              return ancestor;
            };

            if (passedPaths.length) {
              const result = await fullname(passedPaths[0]);
              computedScope = result.ambiguous ? getAncestor(result.files) : result.file;
            } else {
              // staged.length == 0 is impossible b/c yargs check() validation
              if (latestStagedPaths.length == 1) computedScope = latestStagedPaths[0];
              else computedScope = getAncestor(latestStagedPaths);
            }

            computedScope = computedScope.toLowerCase();
          } else {
            debug('deriving as as-is');

            if (passedPaths.length) {
              computedScope = passedPaths[0];
            } else
              throw new Error('use of --scope-as-is without path argument is ambiguous');
          }

          message = `${commitType}(${computedScope}): ${commitMessage}`;
        }
      }

      await makeCommit(message, !finalArgv.silent);
      return finalArgv;
    }
  };
}
