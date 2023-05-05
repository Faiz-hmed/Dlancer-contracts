// Function to check if Platform account is added; Return true if added, false otherwise. 
async function verifyCollab(repoOwner, repoName) {
    let present, res;

    try{
        res = await octokit.request(`GET /repos/${repoOwner}/${repoName}/collaborators`, {
            owner: repoOwner,
            repo: repoName,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
        })
    } catch(err){
        return false;
    }

    const collabs = res.data;
    
    for(let collab of collabs){
        if(collab.login === 'Dlancer-org') {
            return true;
        }
    }
}


// TODO: Check if branch protection rule & status check is present 