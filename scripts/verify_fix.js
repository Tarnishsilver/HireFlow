const http = require('http');

function testLocalApi(question) {
    return new Promise((resolve) => {
        console.log(`Testing local API with question: "${question}"...`);

        const data = JSON.stringify({
            question: question
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/policy/ask',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                const fs = require('fs');
                try {
                    const json = JSON.parse(responseBody);
                    console.log(`Answer: ${json.answer}`);
                    fs.writeFileSync('verify_result.txt', `Answer: ${json.answer}`, 'utf8');
                    resolve(json);
                } catch (e) {
                    console.log("Raw Response:", responseBody);
                    fs.writeFileSync('verify_result.txt', `Error parsing: ${responseBody}`, 'utf8');
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
    await testLocalApi("what is the company policy on leaving");
}

run();
