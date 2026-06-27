import type {
  mockClear as mockClearFn,
  mockDeep as mockDeepFn,
  mock as mockFn,
  mockReset as mockResetFn,
} from "vitest-mock-extended";

declare global {
  var mock: typeof mockFn;
  var mockDeep: typeof mockDeepFn;
  var mockReset: typeof mockResetFn;
  var mockClear: typeof mockClearFn;

  type Mocked<T> = import("vitest-mock-extended").MockProxy<T>;
  type DeepMocked<T> = import("vitest-mock-extended").DeepMockProxy<T>;
}
