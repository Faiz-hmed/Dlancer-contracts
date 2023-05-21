const {Octokit} = require('@octokit/core');
const {Base64} = require('js-base64');
const yaml = require('js-yaml')
const fs = require('fs');
const fetch = require('node-fetch');

//file path is inclusive of the file name & extension
async function commit(repoName, default_branch ,repoOwner, filePath, fileContent){

    repoName = String(repoName);
    repoOwner = String(repoOwner);

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    let res;
    console.log(default_branch)
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

    res = await octokit.request(`POST /repos/${repoOwner}/${repoName}/git/blobs`, {
        owner: repoOwner,
        repo: repoName,
        content: String(Base64.encode(fileContent)),
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
            path: String(filePath),
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

module.exports = commit