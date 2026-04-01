# @iforge.it/mssql-mcp

Minimal, unrestricted MCP server for Microsoft SQL Server.

One tool. No restrictions. Full control over your database.

## Why?

Most MSSQL MCP servers block system views (`sys.sql_modules`, `sys.dm_*`), DDL statements (`ALTER`, `CREATE PROCEDURE`), and admin operations (`sp_add_jobstep`, `sp_start_job`). This one doesn't.

**`execute_sql`** runs any SQL query — SELECT, ALTER, CREATE, DROP, EXEC, system views, everything. Security is handled by Claude Code's built-in tool approval — you see every query before it runs and approve or deny it.

## Install

### Option 1: npx (no install needed)

Configure `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "npx",
      "args": ["-y", "@iforge.it/mssql-mcp"],
      "env": {
        "MSSQL_HOST": "localhost",
        "MSSQL_DATABASE": "mydb",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "yourpassword",
        "MSSQL_PORT": "1433"
      }
    }
  }
}
```

**Windows** — use `cmd /c` wrapper:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@iforge.it/mssql-mcp"],
      "env": {
        "MSSQL_HOST": "localhost",
        "MSSQL_DATABASE": "mydb",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "yourpassword",
        "MSSQL_PORT": "1433"
      }
    }
  }
}
```

### Option 2: Global install

```bash
npm install -g @iforge.it/mssql-mcp
```

Then in `.mcp.json`:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "mssql-mcp",
      "env": {
        "MSSQL_HOST": "localhost",
        "MSSQL_DATABASE": "mydb",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "yourpassword",
        "MSSQL_PORT": "1433"
      }
    }
  }
}
```

### Option 3: From source

```bash
git clone https://github.com/iforgeit/mssql-mcp.git
cd mssql-mcp
npm install
```

Then in `.mcp.json`:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["/path/to/mssql-mcp/index.js"],
      "env": {
        "MSSQL_HOST": "localhost",
        "MSSQL_DATABASE": "mydb",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "yourpassword",
        "MSSQL_PORT": "1433"
      }
    }
  }
}
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MSSQL_HOST` | Yes | — | SQL Server hostname or IP |
| `MSSQL_DATABASE` | Yes | — | Database name |
| `MSSQL_USER` | Yes | — | SQL auth username |
| `MSSQL_PASSWORD` | Yes | — | SQL auth password |
| `MSSQL_PORT` | No | `1433` | SQL Server port |
| `MSSQL_ENCRYPT` | No | `true` | Enable TLS encryption (`true`/`false`). Set to `false` only for local/trusted networks |
| `MSSQL_TRUST_SERVER_CERTIFICATE` | No | `false` | Trust self-signed certificates (`true`/`false`). Enable for dev/local servers |

You can use system environment variables with `${VAR_NAME}` syntax in `.mcp.json`:

```json
"MSSQL_PASSWORD": "${MY_SQL_PASSWORD}"
```

## Tool

### `execute_sql`

Executes any SQL query against the connected database.

**Input:** `query` (string) — any valid T-SQL statement.

**Examples:**

```sql
-- Read data
SELECT TOP 10 * FROM users

-- DDL
ALTER TABLE users ADD email NVARCHAR(256)

-- Stored procedures
EXEC sp_help 'users'

-- View procedure source code
SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('dbo.my_proc')

-- SQL Agent jobs
SELECT name, enabled FROM msdb.dbo.sysjobs

-- System views
SELECT * FROM sys.dm_exec_sessions WHERE is_user_process = 1
```

**Returns:** JSON with `rowCount`, `columns`, `rows` for SELECT queries, or `rowsAffected` for write operations.

## Security

This MCP server has **no built-in query restrictions**. Security is handled at two levels:

1. **Claude Code approval** — every tool call requires user confirmation (unless you explicitly allow it). You see the full SQL before execution.
2. **SQL Server permissions** — the connected user's database permissions apply as usual.

**Recommendations:**
- Don't click "Allow always" for `execute_sql` — review each query
- Use a database user with appropriate permissions, not `sa`
- Add `.mcp.json` to `.gitignore` if it contains credentials
- Use environment variables for passwords instead of hardcoding them

## License

MIT
