const {Octokit} = require('@octokit/core');
const {Base64} = require('js-base64');
const yaml = require('js-yaml')
const fs = require('fs');
const fetch = require('node-fetch');

async function commitWorkflow(repoName, default_branch ,repoOwner, depInstallCmd){

    repoName = String(repoName);
    repoOwner = String(repoOwner);

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    let res;

    // To get the commmit pointed to by HEAD ref
    res = await octokit.request(`GET /repos/${repoOwner}/${repoName}/git/ref/heads/${String(default_branch)}`, {
        owner: repoOwner,
        repo: repoName,
        ref: 'heads/'+String(default_branch),
        headers: {
        'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    const ref_sha = res.data.object.sha;
    const ref_url = res.data.object.url;

    // To get the commit object (details/retrieve) from the commit url
    res = await fetch(ref_url);
    res = await res.json();

    const commit_sha = res.sha;
    const tree_sha = res.tree.sha;
    const tree_url = res.tree.url;

    // Fetch the worflow template
    const template = await fetch("https://raw.githubusercontent.com/Dlancer-org/Collaboration-scripts/master/template.yml");
    const templateText = await template.text();
    
    // Replaces the template's dependency installer placeholder with client specific installer Cmd 
    const templateYaml = yaml.load(templateText);
    const steps = templateYaml.jobs.test.steps;

    steps[1].run = depInstallCmd;

    const expYaml = yaml.dump(templateYaml);

    res = await octokit.request(`POST /repos/${repoOwner}/${repoName}/git/blobs`, {
        owner: repoOwner,
        repo: repoName,
        content: String(Base64.encode(expYaml)),
        encoding: 'base64',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    // Storing the created blob SHA1 hash
    const new_blob_sha = res.data.sha;

    // To create a new tree object with the new blob
    res = await octokit.request(`POST /repos/${repoOwner}/${repoName}/git/trees`, {
        owner: repoOwner,
        repo: repoName,
        base_tree: String(tree_sha),
        tree: [
            {
            path: ".github/workflows/Dlancer-Integration.yaml",
            mode: '100644',
            type: 'blob',
            sha: new_blob_sha
            }
        ],
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    const new_tree_sha = res.data.sha;

    // To create commit object from the new tree
    res = await octokit.request(`POST /repos/${repoOwner}/${repoName}/git/commits`, {
        owner: repoOwner,
        repo: repoName,
        message: 'Integrated project with DLancer',
        parents: [
            String(commit_sha)
        ],
        tree: String(new_tree_sha),
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    const new_commit_sha = res.data.sha;

    // To update HEAD to point to the new commit
    res = await octokit.request(`PATCH /repos/${repoOwner}/${repoName}/git/refs/heads/${String(default_branch)}`, {
        owner: repoOwner,
        repo: repoName,
        ref: 'refs/heads/'+String(default_branch),
        sha: String(new_commit_sha),
        force: true,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

}

module.exports = commitWorkflow