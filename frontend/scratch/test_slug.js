const fetch = require('node-fetch');

async function test() {
    const slug = 'user-host';
    const url = `http://127.0.0.1:4042/users/${slug}`;
    console.log(`Fetching from ${url}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
