#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mssql = require('mssql');

const SQL_FILE = path.join(__dirname, '..', 'migrations', '0002_add_role.sql');

async function run() {
  const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'FinApp123!',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    database: process.env.DB_NAME || 'fin_users_db',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true
    }
  };

  console.log('Connecting to SQL Server...');
  let pool;
  try {
    pool = await mssql.connect(config);
    console.log('✅ Connected to SQL Server');
  } catch (err) {
    console.error('❌ Could not connect to SQL Server:', err.message || err);
    process.exit(1);
  }

  try {
    if (!fs.existsSync(SQL_FILE)) {
      console.error('❌ SQL file not found:', SQL_FILE);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
    console.log('\nExecuting migration...');
    
    const result = await pool.request().query(sqlContent);
    console.log('✅ Migration completed successfully');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error running migration:', err);
    process.exit(1);
  } finally {
    try { await pool.close(); } catch (e) {}
  }
}

run();

