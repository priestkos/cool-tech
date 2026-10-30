import { MAX_ROWS, type ParseResult, type ParsedTable } from "./types";

function trimRows(table: ParsedTable): ParsedTable {
  if (table.rows.length <= MAX_ROWS) return table;
  return {
    columns: table.columns,
    rows: table.rows.slice(0, MAX_ROWS),
  };
}

function parseJsonTable(raw: string): ParseResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, error: "JSON must be a valid array of objects." };
  }
  if (!Array.isArray(value)) {
    return { ok: false, error: "JSON must be an array of objects." };
  }
  if (value.length === 0) {
    return { ok: false, error: "Dataset is empty." };
  }
  const rows: Record<string, string>[] = [];
  const columnSet = new Set<string>();
  for (let i = 0; i < value.length; i++) {
    const row = value[i];
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      return { ok: false, error: `Row ${i + 1} must be an object.` };
    }
    const record: Record<string, string> = {};
    for (const [key, cell] of Object.entries(row as Record<string, unknown>)) {
      if (cell === null || cell === undefined) {
        record[key] = "";
      } else if (typeof cell === "object") {
        return { ok: false, error: `Row ${i + 1}, column "${key}": nested values are not supported.` };
      } else {
        record[key] = String(cell);
      }
      columnSet.add(key);
    }
    rows.push(record);
  }
  const columns = [...columnSet];
  if (columns.length === 0) {
    return { ok: false, error: "No columns found in JSON." };
  }
  return { ok: true, table: trimRows({ columns, rows }) };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current.trim());
  return out;
}

function parseCsv(raw: string): ParseResult {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { ok: false, error: "CSV is empty." };
  }
  const header = parseCsvLine(lines[0]);
  if (header.some((h) => h.length === 0)) {
    return { ok: false, error: "CSV header must include a name for every column." };
  }
  const columns = header;
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length !== columns.length) {
      return {
        ok: false,
        error: `Row ${i + 1} has ${cells.length} columns; expected ${columns.length}.`,
      };
    }
    const record: Record<string, string> = {};
    columns.forEach((col, idx) => {
      record[col] = cells[idx] ?? "";
    });
    rows.push(record);
  }
  if (rows.length === 0) {
    return { ok: false, error: "CSV has a header but no data rows." };
  }
  return { ok: true, table: trimRows({ columns, rows }) };
}

export function parseDatasetInput(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste CSV or a JSON array of objects." };
  }
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseJsonTable(trimmed);
  }
  return parseCsv(trimmed);
}

export function tableFromObjects(
  columns: string[],
  objects: Record<string, string | number>[],
): ParsedTable {
  const rows = objects.map((obj) => {
    const row: Record<string, string> = {};
    for (const col of columns) {
      row[col] = String(obj[col] ?? "");
    }
    return row;
  });
  return trimRows({ columns, rows });
}
