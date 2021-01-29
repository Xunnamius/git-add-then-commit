import 'jest-extended';

import type { AnyFunction } from '@ergodark/types';

// TODO: add this to @ergodark/types:
export function asMockedFunction<T extends AnyFunction = never>(): jest.MockedFunction<T>;
export function asMockedFunction<T extends AnyFunction>(fn: T): jest.MockedFunction<T>;
export function asMockedFunction<T extends AnyFunction>(fn?: T): jest.MockedFunction<T> {
  return ((fn || jest.fn()) as unknown) as jest.MockedFunction<T>;
}

// TODO: make this into a separate package
export const setArgv = (newArgv: string[]) => {
  const prevArgv = process.argv;
  process.argv = [prevArgv[0], prevArgv[1], ...newArgv];
  return (): void => void (process.argv = prevArgv);
};
