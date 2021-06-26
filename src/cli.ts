import { name as pkgName } from '../package.json';
import { configureProgram } from './index';
import debugFactory from 'debug';

const debug = debugFactory(`${pkgName}:cli`);

export default (({ program, parse }) =>
  parse().catch((e: Error | string) => {
    // @ts-expect-error: // TODO: fix this
    !program.argv.silent &&
      // eslint-disable-next-line no-console
      console.error(
        `fatal: ${(typeof e == 'string' ? e : e.message).replace(/^fatal: /, '')}`
      );
    debug(`error handler: ${e}`);
    process.exit(1);
  }))(configureProgram());
