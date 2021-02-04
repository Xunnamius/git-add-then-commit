import { configureProgram } from '../src/index';
import { name as pkgName } from '../package.json';
import { asMockedFunction } from './setup';

import type { Context } from '../src/index';

const TEST_IDENTIFIER = 'unit-cli';

// ! Note:
// !   - jest.mock calls are hoisted to the top even above imports
// !   - factory function of jest.mock(...) is not guaranteed to run early
// !   - better to manipulate mock in beforeAll() vs using a factory function
jest.mock('../src/index');

const mockedParse = jest.fn(async () => ({}));
const mockedConfigureProgram = asMockedFunction(configureProgram);

const importCli = async () => {
  let pkg;

  // ? Cache-busting
  jest.isolateModules(() => {
    // ? While I'd prefer dynamic import(), it doesn't support cache busting!
    pkg = require('../src/cli').default;
  });

  await pkg;
};

let mockSilent = false;

beforeAll(() => {
  // ? Because side-effects of imports happen right after beforeAll() is called
  mockedConfigureProgram.mockImplementation(
    () =>
      (({
        program: { argv: { silent: mockSilent } },
        parse: mockedParse
      } as unknown) as Context)
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe(`${pkgName} [${TEST_IDENTIFIER}]`, () => {
  it('executes program on import', async () => {
    expect.hasAssertions();

    await importCli();

    expect(mockedConfigureProgram).toBeCalledWith();
    expect(mockedParse).toBeCalledWith();
  });

  it('errors gracefully on exception (with Error instance)', async () => {
    expect.hasAssertions();

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    mockedParse.mockImplementationOnce(async () => {
      throw new Error('problems!');
    });

    await importCli();

    expect(mockedConfigureProgram).toBeCalledWith();
    expect(mockedParse).toBeCalledWith();
    expect(errorSpy).toBeCalledWith(expect.toInclude('problems!'));
    expect(exitSpy).toBeCalledWith(1);

    mockedParse.mockReset();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('errors gracefully on exception (with error string)', async () => {
    expect.hasAssertions();

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    mockedParse.mockImplementationOnce(() => Promise.reject('problems!'));

    await importCli();

    expect(mockedConfigureProgram).toBeCalledWith();
    expect(mockedParse).toBeCalledWith();
    expect(errorSpy).toBeCalledWith(expect.toInclude('problems!'));
    expect(exitSpy).toBeCalledWith(1);

    mockedParse.mockReset();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('respects --silent flag', async () => {
    expect.hasAssertions();

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    mockedParse.mockImplementationOnce(() => Promise.reject('BIG BOY ERROR'));

    mockSilent = true;
    await importCli();

    expect(mockedConfigureProgram).toBeCalledWith();
    expect(mockedParse).toBeCalledWith();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitSpy).toBeCalledWith(1);

    mockedParse.mockReset();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
