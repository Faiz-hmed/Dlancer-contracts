const {Octokit} = require('@octokit/core');

async function closePull(repoName, repoOwner, prNum){   
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    try {
        await octokit.request(`PATCH /repos/${repoOwner}/${repoName}/pulls/${prNum}`, {
            owner: repoOwner,
            repo: repoName,
            pull_number: prNum,
            state: 'closed',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = closePull;
