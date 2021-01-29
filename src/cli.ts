import { name as pkgName } from '../package.json';
import { configureProgram } from './index';
import debugFactory from 'debug';

const debug = debugFactory(`${pkgName}:cli`);

export default (({ program, parse }) =>
  parse().catch((e: Error | string) => {
    !program?.argv.silent &&
      // eslint-disable-next-line no-console
      console.error(`Fatal error: ${typeof e == 'string' ? e : e.message}`);
    debug(`fatal: ${e}`);
    process.exit(1);
  }))(configureProgram());
