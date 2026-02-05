
import fetch from 'node-fetch'; // might need to be dynamic import or use native fetch if node 18+

async function testRegister() {
    console.log("Testing registration...");
    const url = 'http://localhost:5001/api/auth/register';
    const body = {
        email: "test.user@example.com",
        password: "password123",
        name: "Test User",
        phone: "1234567890"
    };

    console.log("Sending:", body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Body:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error:", error);
    }
}

testRegister();
