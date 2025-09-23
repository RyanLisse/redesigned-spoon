import "@testing-library/jest-dom";

declare global {
  // Vitest globals
  const describe: {
    (name: string, fn: () => void): void;
    each<T>(
      cases: readonly T[]
    ): (name: string, fn: (...args: T[]) => void) => void;
    only: (name: string, fn: () => void) => void;
    skip: (name: string, fn: () => void) => void;
    todo: (name: string) => void;
  };

  const it: {
    (name: string, fn?: () => void | Promise<void>): void;
    each<T>(
      cases: readonly T[]
    ): (name: string, fn: (...args: T[]) => void | Promise<void>) => void;
    only: (name: string, fn?: () => void | Promise<void>) => void;
    skip: (name: string, fn?: () => void | Promise<void>) => void;
    todo: (name: string) => void;
  };

  const test: typeof it;

  const expect: {
    (
      actual: any
    ): {
      toBe(expected: any): void;
      toEqual(expected: any): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toBeNull(): void;
      toBeUndefined(): void;
      toBeDefined(): void;
      toContain(item: any): void;
      toHaveLength(length: number): void;
      toThrow(expected?: string | RegExp | Error): void;
      toHaveBeenCalled(): void;
      toHaveBeenCalledWith(...args: any[]): void;
      toHaveBeenCalledTimes(times: number): void;
      [key: string]: any;
    };
    any: (constructor: any) => any;
    anything: () => any;
    arrayContaining: (array: any[]) => any;
    objectContaining: (object: object) => any;
    stringContaining: (string: string) => any;
    stringMatching: (regexp: RegExp | string) => any;
  };

  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;

  const vi: {
    fn: <T extends (...args: any[]) => any>(
      implementation?: T
    ) => {
      (...args: Parameters<T>): ReturnType<T>;
      mockImplementation: (fn: T) => void;
      mockReturnValue: (value: ReturnType<T>) => void;
      mockResolvedValue: (value: Awaited<ReturnType<T>>) => void;
      mockRejectedValue: (value: any) => void;
      mockClear: () => void;
      mockReset: () => void;
      mockRestore: () => void;
      [key: string]: any;
    };
    mock: (path: string, factory?: () => any) => void;
    unmock: (path: string) => void;
    doMock: (path: string, factory?: () => any) => void;
    doUnmock: (path: string) => void;
    mocked: <T>(item: T) => T;
    spyOn: <T, K extends keyof T>(object: T, method: K) => any;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
    restoreAllMocks: () => void;
    [key: string]: any;
  };

  // biome-ignore lint/style/noNamespace: Required for Jest type declarations
  namespace jest {
    type Matchers<R> = {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveClass(...classNames: string[]): R;
    };
  }
}
