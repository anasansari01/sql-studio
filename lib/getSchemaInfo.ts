import { pool } from "@/db/client";

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

export interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
  sampleRows: Record<string, unknown>[];
}

export async function getSchemaInfo(
  sandboxSchema: string,
  tableNames: string[]
): Promise<TableInfo[]> {
  const client = await pool.connect();
  try {
    const tableInfos: TableInfo[] = [];

    for (const tableName of tableNames) {
      const colResult = await client.query<ColumnInfo>(
        `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
        [sandboxSchema, tableName]
      );

      const sampleResult = await client.query(
        `SELECT * FROM ${sandboxSchema}.${tableName} LIMIT 5`
      );

      tableInfos.push({
        tableName,
        columns: colResult.rows,
        sampleRows: sampleResult.rows,
      });
    }

    return tableInfos;
  } finally {
    client.release();
  }
}