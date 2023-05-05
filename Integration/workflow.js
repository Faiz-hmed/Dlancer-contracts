const fs = require('fs');
const fetch = require('node-fetch');

const commit = require('./commit.js');

async function commitWorkflow(repoName, default_branch ,repoOwner){
    // Fetch the workflow template
    const template = await fetch("https://raw.githubusercontent.com/Dlancer-org/Collaboration-scripts/master/template.yml");
    const templateText = await template.text();

    await commit(repoName, default_branch ,repoOwner, ".github/workflows/Dlancer-Integration.yml", templateText)
};

module.exports = commitWorkflow