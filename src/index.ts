import { name as pkgName } from '../package.json';
import { parse as parsePath, basename } from 'path';
import projectorConfigFactory from '@xunnamius/conventional-changelog-projector';
import yargs from 'yargs/yargs';
import debugFactory from 'debug';

import {
  getStagedPaths,
  makeCommit,
  stagePaths,
  fullname,
  isGitRepo,
  commonAncestor
} from './git-lib';

import type { Arguments, Argv } from 'yargs';
import type { FullnameResult } from './git-lib';

export type Program = Argv;
export type { Arguments };
export type Parser = (argv?: string[]) => Promise<Arguments>;

export type Context = {
  program: Program;
  parse: Parser;
};

const debug = debugFactory(`${pkgName}:parse`);
const {
  parserOpts: { noteKeywords }
} = projectorConfigFactory();
// ? See: https://shorturl.at/dotG0
const breakingRegex = RegExp(
  '^[\\s|*]*(' + noteKeywords.join('|') + ')[:\\s]+(.*)',
  'im'
);
const isBreakingChange = (message: string) => breakingRegex.test(message);

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
      'scope-root': {
        alias: 'r',
        describe: 'Use path1 to derive a photogenic scope',
        type: 'boolean'
      },
      silent: {
        alias: 's',
        describe: 'Nothing will be printed to stdout or stderr',
        type: 'boolean'
      },
      force: {
        describe: 'Always stage paths even when doing so could damage the index',
        type: 'boolean'
      },
      verify: {
        describe: 'Use --no-verify to bypass git pre-commit and commit-msg hooks',
        type: 'boolean',
        default: 'true'
      }
    })
    .string('_')
    .group(
      ['scope-omit', 'scope-basename', 'scope-as-is', 'scope-full', 'scope-root'],
      'Scope options:'
    )
    .group(['help', 'version', 'silent', 'verify'], 'Other options:')
    .epilogue('See the full documentation for more details: https://shorturl.at/iuJO7')
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
        '$0 path feat --scope-root "new feature"',
        'Stages file1 & file2 & commits as "feat(path): new feature"'
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
        a == '-' ? '-o' : a == '--' ? '-b' : a == '---' ? '-r' : a
      );

      debug('saw argv: %O', argv);
      const finalArgv = await finalProgram.parse(argv);

      let shouldDeriveScope = false;

      const opCount = [
        'scopeOmit',
        'scopeBasename',
        'scopeAsIs',
        'scopeFull',
        'scopeRoot'
      ].filter((a) => a in finalArgv).length;

      const minArgCount = !!(shouldDeriveScope = !!opCount) ? 2 : 3;

      if (opCount > 1)
        throw new Error('only one scope option is allowed. See --help for details');

      if (finalArgv._.length < minArgCount)
        throw new Error('must pass all required arguments. See --help for details');

      if (!(await isGitRepo()))
        throw new Error('not a git repository (or any of the parent directories): .git');

      const preStagedPaths = await getStagedPaths();
      debug('pre-staged paths: %O', preStagedPaths);

      if (finalArgv._.length == minArgCount && !preStagedPaths.length)
        throw new Error('must stage a file or pass a path. See --help for details');

      const params = Array.from(finalArgv._).map(String);
      const passedPaths = params.splice(0, params.length - (shouldDeriveScope ? 2 : 3));
      const [commitType, commitScope, commitMessage] = shouldDeriveScope
        ? // eslint-disable-next-line no-sparse-arrays
          [params[0], , params[1]]
        : params;

      let message = `${commitType}(${commitScope}): ${commitMessage}`;
      debug(`initial message: ${message}`);

      if (preStagedPaths.length) {
        if (!finalArgv.force) {
          debug('performing dangerous operation check');

          // ? We transform each path arg into all the full paths it represents
          // ? **conditioned on the currently (i.e. "pre-") staged paths**. If any
          // ? of the path args reference pre-staged paths and --force is not in
          // ? effect, error rather than clobber the index with bad state
          const indexIsInDanger = (
            await Promise.allSettled(passedPaths.map((p) => fullname(p)))
          )
            .filter(
              (r): r is PromiseFulfilledResult<FullnameResult> => r.status == 'fulfilled'
            )
            .flatMap(({ value }) => (value.ambiguous ? value.files : value.file))
            .some((fullPassedPath) => preStagedPaths.includes(fullPassedPath));

          if (indexIsInDanger) {
            throw new Error(
              'dangerous operation rejected: "git add" could clobber index state ' +
                '(can be overridden with --force)'
            );
          }
        } else debug('WARNING: skipping dangerous operation check!');
      }

      await stagePaths(passedPaths);
      const latestStagedPaths = await getStagedPaths();

      if (!latestStagedPaths.length) throw new Error('assert failed: nothing to commit');

      if (!commitScope) {
        debug('deriving commit scope based on rules: %O', finalArgv);

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
          } else if (finalArgv.scopeFull || finalArgv.scopeRoot) {
            const scope = finalArgv.scopeRoot ? 'root' : 'full';
            debug(`deriving as ${scope}`);

            const getAncestor = (files: string[]) => {
              const ancestor = commonAncestor(files);
              if (!ancestor) {
                throw new Error(
                  `use of --scope-${scope} is ambiguous without common non-root ${
                    finalArgv.scopeFull ? 'ancestor' : 'first directory in path'
                  }`
                );
              }
              return ancestor;
            };

            if (passedPaths.length) {
              const result = await fullname(passedPaths[0]);
              if (result.ambiguous) {
                computedScope = getAncestor(result.files);
              } else {
                const path = parsePath(result.file);
                computedScope =
                  finalArgv.scopeRoot && !path.dir ? path.name : result.file;
              }
            } else {
              // staged.length == 0 is impossible b/c yargs check() validation
              if (latestStagedPaths.length == 1) computedScope = latestStagedPaths[0];
              else computedScope = getAncestor(latestStagedPaths);
            }

            computedScope = (
              finalArgv.scopeRoot
                ? computedScope.split('/').filter(Boolean)[0]
                : computedScope
            ).toLowerCase();
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

      if (isBreakingChange(commitMessage)) {
        message =
          message.slice(0, message.indexOf(':')) +
          '!' +
          message.slice(message.indexOf(':'));
      }

      await makeCommit(message, !finalArgv.silent, !finalArgv.verify);
      return finalArgv;
    }
  };
}
