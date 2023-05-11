const {Octokit} = require('@octokit/core');

async function merge(repoName, repoOwner, prNum, title, message){
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    await octokit.request(`PUT /repos/${repoOwner}/${repoName}/pulls/${prNum}/merge`, {
        owner: repoOwner,
        repo: repoName,
        pull_number: prNum,
        commit_title: String(title),
        commit_message: String(message),
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    });

}

module.exports = merge;