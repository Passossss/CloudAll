#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mssql = require('mssql');

const SQL_FILE = path.join(__dirname, '..', '..', 'sqlserver-init', 'wipe-and-seed.sql');

async function run() {
  const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'FinApp123!',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true
    },
    database: process.env.DB_NAME || 'fin_users_db'
  };

  console.log('Connecting to SQL Server (fin_users_db)...');
  let pool;
  try {
    pool = await mssql.connect(config);
  } catch (err) {
    console.error('Could not connect to SQL Server:', err.message || err);
    process.exit(1);
  }

  try {
    if (!fs.existsSync(SQL_FILE)) {
      console.error('SQL wipe file not found:', SQL_FILE);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
    // Split batches on lines that contain only GO (case-insensitive)
    const batches = sqlContent.split(/^GO\s*$/gim).map(s => s.trim()).filter(Boolean);

    for (const batch of batches) {
      console.log('Executing batch...');
      await pool.request().batch(batch);
    }

    console.log('Wipe and reseed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error running wipe-and-seed:', err);
    process.exit(1);
  } finally {
    try { await pool.close(); } catch (e) {}
  }
}

run();
