#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mssql = require('mssql');

const SQL_FILE = path.join(__dirname, '..', '..', 'sqlserver-init', 'init-db.sql');

async function run() {
  const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'FinApp123!',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true
    }
  };

  console.log('Connecting to SQL Server (master) to check database...');
  let pool;
  try {
    pool = await mssql.connect({ ...config, database: 'master' });
  } catch (err) {
    console.error('Could not connect to SQL Server:', err.message || err);
    process.exit(1);
  }

  try {
    const result = await pool.request().query("SELECT name FROM sys.databases WHERE name = 'fin_users_db'");
    if (result.recordset && result.recordset.length > 0) {
      console.log('Database fin_users_db already exists — skipping SQL initialization.');
      process.exit(0);
    }

    console.log('Database not found. Running SQL init script...');
    if (!fs.existsSync(SQL_FILE)) {
      console.error('SQL init file not found:', SQL_FILE);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
    // Split batches on lines that contain only GO (case-insensitive)
    const batches = sqlContent.split(/^GO\s*$/gim).map(s => s.trim()).filter(Boolean);

    for (const batch of batches) {
      console.log('Executing batch...');
      await pool.request().batch(batch);
    }

    console.log('SQL initialization completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error running SQL init:', err);
    process.exit(1);
  } finally {
    try { await pool.close(); } catch (e) {}
  }
}

run();
