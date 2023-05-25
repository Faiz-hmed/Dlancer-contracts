const {Octokit} = require('@octokit/core');

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})


async function acceptInvites(){
    const invites = await octokit.request("GET /user/repository_invitations");

    for(invite of invites.data){
        const invId = invite.id;

        if(!invite.expired){
            const res = await octokit.request(`PATCH /user/repository_invitations/${invId}`);
        }
    }

}

// async function checkInvites(){
//     let cnt = 0;

//     while(true){

//         await new Promise(resolve => setTimeout(acceptInvites, 60000, resolve, cnt));

//         cnt += 1;

//         if(cnt === 5) break;
//     }
// }

module.exports = acceptInvites;