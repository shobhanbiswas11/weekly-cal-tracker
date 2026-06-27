import { mock, mockClear, mockDeep, mockReset } from "vitest-mock-extended";

const g = globalThis as any;
g.mock = mock;
g.mockDeep = mockDeep;
g.mockReset = mockReset;
g.mockClear = mockClear;
