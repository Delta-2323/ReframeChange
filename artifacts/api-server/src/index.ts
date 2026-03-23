import app from "./app";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE surveys
        ADD COLUMN IF NOT EXISTS stakeholder_email TEXT NOT NULL DEFAULT 'unknown@example.com';
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
