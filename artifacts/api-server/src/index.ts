import app from "./app";
import { pool } from "@workspace/db";

const port = Number(process.env["PORT"] ?? "8080");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE surveys
        ADD COLUMN IF NOT EXISTS stakeholder_email TEXT NOT NULL DEFAULT 'unknown@example.com';
      ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS document_name TEXT;
      ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS document_mime_type TEXT;
      ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS document_data TEXT;
    `);
    console.log("Migrations complete.");
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Migration failed, aborting startup:", err);
    process.exit(1);
  });
