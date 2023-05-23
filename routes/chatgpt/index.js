const express = require('express');
const router = express.Router();
const path = require('path');
const { ethers} = require('hardhat');
const {abi} = require('../../../frontend/constants/index.js')

require('dotenv').config()
const {Configuration,OpenAIApi} = require("openai")
const Models = require('../../Schema/index.js');
const taskModel = Models.Tasks;
const projectModel = Models.Projects;
const userModel = Models.Users;


// To complete the task
router.post('/complete/:taskid', async (req, res)=>{
    const {code,address,description} = req.body;
    try {
        // console.log(code,address,description)
     
        const openai = new OpenAIApi(new Configuration({
        apiKey:process.env.CHATGPT
        }))
        openai.createChatCompletion({
            model:"gpt-3.5-turbo",
            messages:[{role:"system",content:`Does the code do what the description says and is it error free(if there are spelling mistakes or syntax errors return false)? return true or false only, please don't correct the code, just validate it:Description:${description} code:${code}`}]
        }).then((resp)=>{
            return resp.data.choices[0].message.content;
        }).then(async (resp)=>{
            console.log(resp)
            if(resp.toLowerCase().includes('true')){
                const provider = new ethers.providers.JsonRpcProvider(process.env.GANACHE_RPC);
                const contract = new ethers.Contract(address, abi, provider);
    
                const privateKey = `0x${process.env.ADMIN_PRIVATE_KEY}`;
                const signer = new ethers.Wallet(privateKey, provider);
                const connectedContract = contract.connect(signer);
            //main thing
                const tx = await connectedContract.completeTask();
                const receipt = await provider.waitForTransaction(tx.hash);
                const task = await taskModel.findById(req.params.taskid);
                task.code = code;
                await task.save();
                const user  = await userModel.findOne({walletID:task.freelancer});
                user.tasksCompleted.push(task._id);
                user.save();
                if(!receipt) return res.status(500).json({})
                return res.status(200).json({ receipt });
            }
            else    return res.status(500).json({success:false,message:"did not pass test cases"})
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal Server Error"});
    }

    // Call completeTask here

    // return res.status(200).json({message: "Success"});
});

module.exports = router;