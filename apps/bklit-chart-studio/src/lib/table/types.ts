export const MAX_ROWS = 200;

export type ParsedTable = {
  columns: string[];
  rows: Record<string, string>[];
};

export type ParseSuccess = { ok: true; table: ParsedTable };
export type ParseFailure = { ok: false; error: string };
export type ParseResult = ParseSuccess | ParseFailure;
