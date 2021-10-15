require('dotenv').config();
const axios = require('axios');
const constants = require('./constants');

async function EndSandbox (space, sandboxId) {
    try {
        // set authorization header
        const config = {
            headers: { 'Authorization': `Bearer ${process.env.TORQUE_TOKEN}` }
        };
        // build url for get sandbox details
        const url = `${constants.TORQUE_API_BASE_URL}/spaces/${space}/sandbox/${sandboxId}`;
        // end sandbox
        await axios.delete(url, config);
        console.log(`End request sent for sandbox ${sandboxId}`);
    } catch (error) {
        console.error(JSON.stringify(error));
    }
}

(async () => {
    // we assume that this file is excuted like this: "node endSandbox.js <sandbox id>"
    const sandboxId = process.argv[2];
    // Define torque space
    const space = 'sample';
    // End the sandbox
    await EndSandbox('sample', sandboxId);
})().catch(e => {
    // Deal with the fact the chain failed
    console.error(e);
});