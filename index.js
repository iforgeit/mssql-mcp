#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import sql from "mssql";
import { z } from "zod";

const config = {
  server: process.env.MSSQL_HOST,
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  port: parseInt(process.env.MSSQL_PORT || "1433"),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

const server = new McpServer({
  name: "mssql",
  version: "1.0.0",
});

server.tool(
  "execute_sql",
  "Execute any SQL query against MSSQL database.",
  { query: z.string().describe("SQL query to execute") },
  async ({ query }) => {
    try {
      const p = await getPool();
      const result = await p.request().query(query);
      if (result.recordset && result.recordset.length > 0) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              rowCount: result.recordset.length,
              columns: Object.keys(result.recordset[0]),
              rows: result.recordset.slice(0, 1000),
              rowsAffected: result.rowsAffected,
            }, null, 2),
          }],
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify({ rowCount: 0, rows: [], rowsAffected: result.rowsAffected, message: "OK" }, null, 2) }],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
