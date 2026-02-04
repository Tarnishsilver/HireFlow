const https = require('https');

function testRag(companyId, question) {
    console.log(`Testing with company_id: "${companyId}"...`);

    const data = JSON.stringify({
        company_id: companyId,
        question: question,
        session_id: "test_script_session"
    });

    const options = {
        hostname: 'ragbot-g06a.onrender.com',
        path: '/ask',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            try {
                console.log("Response:", JSON.stringify(JSON.parse(responseBody), null, 2));
            } catch (e) {
                console.log("Raw Response:", responseBody);
            }
            console.log("------------------------------------------------");
        });
    });

    req.on('error', (error) => {
        console.error(`Error: ${error.message}`);
    });

    req.write(data);
    req.end();
}

// Run tests sequentially broadly (ignoring strict async ordering for simplicity)
setTimeout(() => testRag("test", "What is the leave policy?"), 0);
setTimeout(() => testRag("default", "What is the leave policy?"), 3000);
