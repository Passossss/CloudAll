// Direct test script: call user-service and transaction-service directly (no BFF)
// Node >=18 required (global fetch)
const USER_BASE = process.env.USER_BASE || 'http://localhost:3001/api';
const TX_BASE = process.env.TX_BASE || 'http://localhost:3002/api';

async function req(base, method, path, body) {
  const url = base.replace(/\/$/, '') + path;
  const opts = { method, headers: {} };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) { json = null; }
    return { ok: res.ok, status: res.status, json, text };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('Direct test calling user-service and transaction-service');

  console.log('\n1) GET Users (direct)');
  const users = await req(USER_BASE, 'GET', '/users');
  console.log(' ->', users.status, users.error || (users.json ? JSON.stringify(users.json) : users.text).slice(0,1000));

  console.log('\n2) GET Transactions (direct)');
  const tx = await req(TX_BASE, 'GET', '/transactions');
  console.log(' ->', tx.status, tx.error || (tx.json ? JSON.stringify(tx.json).slice(0,1000) : tx.text));

  console.log('\nValidation:\n');
  if (users.ok && users.json && users.json.data && Array.isArray(users.json.data.users)) {
    console.log('Users list OK — count:', users.json.data.users.length);
  } else {
    console.log('Users list FAILED — response shape:', users.json ? Object.keys(users.json) : users.error || users.text.slice(0,200));
  }

  if (tx.ok && tx.json && tx.json.data && Array.isArray(tx.json.data.transactions)) {
    console.log('Transactions list OK — count:', tx.json.data.transactions.length);
  } else {
    console.log('Transactions list FAILED — response shape:', tx.json ? Object.keys(tx.json) : tx.error || tx.text.slice(0,200));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
