const fs = require('fs');
const path = require('path');

async function main() {
    const openapiPath = path.join(__dirname, '..', 'bff', 'src', 'openapi.json');
    const raw = fs.readFileSync(openapiPath, 'utf8');
    const doc = JSON.parse(raw);
    const base = doc.servers && doc.servers[0] && doc.servers[0].url ? doc.servers[0].url.replace(/\/$/, '') : 'http://localhost:3000/api';
    console.log('Base URL:', base);

    const results = [];

    async function req(method, route, body) {
        const url = base + route;
        const opts = { method, headers: {} };
        if (body) {
            opts.headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(body);
        }
        try {
            const res = await fetch(url, opts);
            let text = await res.text();
            let json = null;
            try { json = JSON.parse(text); } catch (e) { json = null; }
            return { ok: res.ok, status: res.status, json, text };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    const timestamp = Date.now();
    const userPayload = { email: `test+${timestamp}@example.com`, password: 'Pass123!', name: 'Smoke Tester' };
    console.log('\n1) POST /users/register');
    const reg = await req('POST','/users/register', userPayload);
    console.log(' ->', reg.status, reg.error || (reg.json ? JSON.stringify(reg.json) : reg.text));
    results.push({path:'/users/register', method:'POST', result:reg});

    let userId = null;
    if (reg.json) {
        userId = reg.json.id || (reg.json.user && reg.json.user.id) || reg.json.userId || reg.json._id || null;
        if (!userId && typeof reg.text === 'string') {
            const m = reg.text.match(/[0-9a-fA-F\-]{8,}/);
            if (m) userId = m[0];
        }
    }

    console.log('\n2) POST /users/login');
    const login = await req('POST','/users/login', { email: userPayload.email, password: userPayload.password });
    console.log(' ->', login.status, login.error || (login.json ? JSON.stringify(login.json) : login.text));
    results.push({path:'/users/login', method:'POST', result:login});

    let token = null;
    if (login.json) {
        token = login.json.token || (login.json.data && login.json.data.token) || null;
    }

    // Public GET all users (list)
    console.log('\n2.1) GET /users');
    const getUsers = await req('GET','/users');
    console.log(' ->', getUsers.status, getUsers.error || (getUsers.json ? JSON.stringify(getUsers.json).slice(0,500) : getUsers.text));
    results.push({path:'/users', method:'GET', result:getUsers});

    // Public GET all transactions (list)
    console.log('\n2.2) GET /transactions');
    const getAllTx = await req('GET','/transactions');
    console.log(' ->', getAllTx.status, getAllTx.error || (getAllTx.json ? JSON.stringify(getAllTx.json).slice(0,500) : getAllTx.text));
    results.push({path:'/transactions', method:'GET', result:getAllTx});

    async function authReq(method, route, body) {
        const url = base + route;
        const opts = { method, headers: {} };
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;
        if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
        try {
            const res = await fetch(url, opts);
            const text = await res.text();
            let json = null; try { json = JSON.parse(text); } catch (e) { json = null; }
            return { ok: res.ok, status: res.status, json, text };
        } catch (err) { return { ok:false, error: err.message }; }
    }

    if (userId) {
        console.log(`\n3) GET /users/profile/${userId}`);
        const getProf = await authReq('GET',`/users/profile/${userId}`);
        console.log(' ->', getProf.status, getProf.error || (getProf.json ? JSON.stringify(getProf.json) : getProf.text));
        results.push({path:`/users/profile/{id}`, method:'GET', result:getProf});

        console.log(`\n4) PUT /users/profile/${userId}`);
        const putProf = await authReq('PUT',`/users/profile/${userId}`, { name: 'Smoke Tester Updated' });
        console.log(' ->', putProf.status, putProf.error || (putProf.json ? JSON.stringify(putProf.json) : putProf.text));
        results.push({path:`/users/profile/{id}`, method:'PUT', result:putProf});
    } else {
        console.log('\nSkipping profile GET/PUT because user id not found from register response');
    }

    console.log('\n5) Create a second user for delete test');
    const userPayload2 = { email: `del+${timestamp}@example.com`, password: 'Pass123!', name: 'DeleteMe' };
    const reg2 = await req('POST','/users/register', userPayload2);
    console.log(' ->', reg2.status, reg2.error || (reg2.json ? JSON.stringify(reg2.json) : reg2.text));
    results.push({path:'/users/register', method:'POST', result:reg2});
    let user2Id = null;
    if (reg2.json) user2Id = reg2.json.id || reg2.json.userId || reg2.json._id || (reg2.json.user && reg2.json.user.id) || null;

    if (user2Id) {
        console.log(`\n6) DELETE /users/profile/${user2Id}`);
        const del = await authReq('DELETE',`/users/profile/${user2Id}`);
        console.log(' ->', del.status, del.error || (del.json ? JSON.stringify(del.json) : del.text));
        results.push({path:`/users/profile/{id}`, method:'DELETE', result:del});
    } else {
        console.log('\nSkipping delete test because second user id not returned');
    }

    // Transactions
    let txId = null;
    let lastTxObj = null;
    if (userId) {
        console.log(`\n7) POST /transactions (for user ${userId})`);
        const txPayload = { userId, amount: 123.45, category: 'food', type: 'expense', date: new Date().toISOString(), description: 'smoke tx' };
        const createTx = await authReq('POST','/transactions', txPayload);
        console.log(' ->', createTx.status, createTx.error || (createTx.json ? JSON.stringify(createTx.json) : createTx.text));
        results.push({path:'/transactions', method:'POST', result:createTx});
        if (createTx.json) {
            txId = createTx.json.id || createTx.json._id || (createTx.json.transaction && createTx.json.transaction.id) || (createTx.json.transaction && createTx.json.transaction._id) || null;
            if (createTx.json.transaction) lastTxObj = createTx.json.transaction;
        }

        // 8) GET /transactions/user/{userId}
        console.log(`\n8) GET /transactions/user/${userId}`);
        const listTx = await authReq('GET',`/transactions/user/${userId}`);
        console.log(' ->', listTx.status, listTx.error || (listTx.json ? JSON.stringify(listTx.json).slice(0,500) : listTx.text));
        results.push({path:'/transactions/user/{userId}', method:'GET', result:listTx});

        if (txId) {
            console.log(`\n9) GET /transactions/${txId}`);
            const getTx = await authReq('GET',`/transactions/${txId}`);
            console.log(' ->', getTx.status, getTx.error || (getTx.json ? JSON.stringify(getTx.json) : getTx.text));
            results.push({path:'/transactions/{id}', method:'GET', result:getTx});
            if (getTx.json && getTx.json.transaction) lastTxObj = getTx.json.transaction;

            console.log(`\n10) PUT /transactions/${txId}`);
            // Build a full payload from existing transaction and change amount/category
            const updatePayload = Object.assign({}, lastTxObj || {}, { amount: 200, category: 'shopping' });
            // Ensure we pass minimal required fields if some are missing
            if (!updatePayload.userId) updatePayload.userId = userId;
            if (!updatePayload.type) updatePayload.type = 'expense';
            if (!updatePayload.description) updatePayload.description = updatePayload.description || 'updated by smoke test';

            const putTx = await authReq('PUT',`/transactions/${txId}`, updatePayload);
            console.log(' ->', putTx.status, putTx.error || (putTx.json ? JSON.stringify(putTx.json) : putTx.text));
            results.push({path:'/transactions/{id}', method:'PUT', result:putTx});

        } else {
            console.log('\nSkipping individual transaction GET/PUT because transaction id not found');
        }

        // 11) summary
        console.log(`\n11) GET /transactions/user/${userId}/summary`);
        const summary = await authReq('GET',`/transactions/user/${userId}/summary`);
        console.log(' ->', summary.status, summary.error || (summary.json ? JSON.stringify(summary.json) : summary.text));
        results.push({path:'/transactions/user/{userId}/summary', method:'GET', result:summary});

        // 12) categories
        console.log(`\n12) GET /transactions/user/${userId}/categories`);
        const cats = await authReq('GET',`/transactions/user/${userId}/categories`);
        console.log(' ->', cats.status, cats.error || (cats.json ? JSON.stringify(cats.json) : cats.text));
        results.push({path:'/transactions/user/{userId}/categories', method:'GET', result:cats});
    } else {
        console.log('\nSkipping transactions tests because user id not available');
    }

    // summary
    console.log('\n\n=== SUMMARY ===');
    for (const r of results) {
        const p = r.path + ' ' + (r.method || '');
        const ok = r.result && r.result.ok;
        const status = r.result && r.result.status ? r.result.status : (r.result && r.result.error ? 'ERR' : 'N/A');
        console.log(p.padEnd(40), 'status:', status, ok ? 'OK' : 'FAIL');
    }
}

main().catch(e => { console.error(e); process.exit(1); });
