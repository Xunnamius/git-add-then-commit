import { name as pkgName } from 'package';
import { configureProgram } from './index';
import debugFactory from 'debug';

const debug = debugFactory(`${pkgName}:cli`);

export default (({ program, parse }) =>
  parse().catch(async (e: Error | string) => {
    !(await program.argv).silent &&
      // eslint-disable-next-line no-console
      console.error(
        `fatal: ${(typeof e == 'string' ? e : e.message).replace(/^fatal: /, '')}`
      );
    debug(`error handler: ${e}`);
    process.exit(1);
  }))(configureProgram());
