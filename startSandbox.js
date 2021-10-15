require('dotenv').config();
const axios = require('axios');
const constants = require('./constants');
const utils = require('./utils');


async function StartSandbox (space, sandboxName, blueprintName, inputs, artifacts) {
    try {
        // set authorization header
        const config = {
            headers: { 'Authorization': `Bearer ${process.env.TORQUE_TOKEN}` }
        };
        // create post data
        const data = {
            sandbox_name: sandboxName,
            blueprint_name: blueprintName,
            inputs,
            artifacts,
            automation: true,
            duration: 'PT2H' // ISO 8601 date format - 2 hours
        };
        // build url for create new sandbox
        const url = `${constants.TORQUE_API_BASE_URL}/spaces/${space}/sandbox`;
        // create new sandbox
        const response = await axios.post(url, data, config);
        // return sandbox id
        const sandboxId = response.data['id'];
        console.log(`New sandbox created. Sandbox Id: ${sandboxId}`);
        return sandboxId;
    } catch (error) {
        console.error(JSON.stringify(error));
    }
}

async function WaitUntilActive (space, sandboxId, timeoutInMinutes) {
    try {
        // set authorization header
        const config = {
            headers: { 'Authorization': `Bearer ${process.env.TORQUE_TOKEN}` }
        };
        // build url for get sandbox details
        const url = `${constants.TORQUE_API_BASE_URL}/spaces/${space}/sandbox/${sandboxId}`;
        
        let deployingSandbox = true;
        const startTime = Date.now();
        const timeoutInMs = timeoutInMinutes * 60000; // convert minutes to milliseconds
        const sleepInterval = 10000; // 10 seconds

        while (deployingSandbox && (Date.now() - startTime) < timeoutInMs) {
            // get sandbox details
            const response = await axios.get(url, config);
            // get sandbox status
            const sandboxStatus = response.data['sandbox_status'];
            // check if sandbox status is Active has an Error or Ended
            if (constants.FINAL_SB_STATUSES.includes(sandboxStatus)) {
                console.log(`Sandbox deployment finished with status ${sandboxStatus}`);
                deployingSandbox = false;
                break;
            }            
            // sleep for 10 seconds between sandbox status pulls
            console.log(`Waiting for sandbox to be Active. Sandbox status is ${sandboxStatus}. Sleeping for 10 seconds...`);
            await utils.sleep(sleepInterval); 
        }
        if (deployingSandbox) {
            console.error(`ERROR: reached ${timeoutInMinutes} minutes timeout but sandbox is still deploying :(`)
        }
    } catch (error) {
        console.error(JSON.stringify(error));
    }
}

(async () => {
    // Define torque space
    const space = 'sample';
    // Define blueprint name
    const blueprintName = '[Sample]WordPress Basic Stack (AWS)';
    // Define blueprint user inputs
    const inputs = {
        DB_USER: 'root',
        DB_PASS: 'root',
        DB_NAME: 'wordpress_demo',
    };
    // Define blueprint artifacts. Current sample blueprint doesnt use any artifacts
    const artifacts = {};
    
    // Start a new sandbox
    const sandboxId = await StartSandbox(space, 'automation sandbox', blueprintName, inputs, artifacts);
    
    // Wait until sandbox is active
    const timeoutInMinutes = 30;
    await WaitUntilActive(space, sandboxId, timeoutInMinutes);
})().catch(e => {
    // Deal with the fact the chain failed
    console.error(e);
});