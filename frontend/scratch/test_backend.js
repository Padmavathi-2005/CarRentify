async function testFetch() {
  const url = 'http://127.0.0.1:4042/users/6a0179f3a17126785aa38c27';
  console.log(`Fetching from ${url}...`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testFetch();
