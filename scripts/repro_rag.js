const https = require('https');

function testRag(companyId, question) {
    return new Promise((resolve) => {
        console.log(`Testing with question: "${question}"...`);

        const data = JSON.stringify({
            company_id: companyId,
            question: question,
            session_id: "test_script_repro"
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
                try {
                    const json = JSON.parse(responseBody);
                    console.log(`Answer: ${json.answer}`);
                    resolve(json);
                } catch (e) {
                    console.log("Raw Response:", responseBody);
                    resolve(null);
                }
                console.log("------------------------------------------------");
            });
        });

        req.on('error', (error) => {
            console.error(`Error: ${error.message}`);
            resolve(null);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    await testRag("test", "what is the company policy on leaving");
    await testRag("test", "what is the company policy on termination");
    await testRag("test", "what is the company policy on resignation");
}

run();
