import { vi } from 'vitest'

vi.mock('@srcbook/shared', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    randomid: vi.fn(() => 'test-id'),
    CellExecPayloadSchema: {
      parse: vi.fn(),
    },
    CellStopPayloadSchema: {
      parse: vi.fn(),
    },
    CellCreatePayloadSchema: {
      parse: vi.fn(),
    },
    CellUpdatePayloadSchema: {
      parse: vi.fn(),
    },
    CellRenamePayloadSchema: {
      parse: vi.fn(),
    },
    CellDeletePayloadSchema: {
      parse: vi.fn(),
    },
  }
}) 