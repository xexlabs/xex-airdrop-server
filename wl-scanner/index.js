'use strict'
const {AnkrProvider} = require('@ankr.com/ankr.js');
const fs = require('fs');
const dotenv = require("dotenv");
dotenv.config()
const provider = new AnkrProvider(process.env.ANKR)
const Web3 = require('web3');

const mainAddress = '0xa41A879bcFdd75983a987FD6b68fae37777e8b28'.toLowerCase();
const claimRankTopic = '0xc05062aaca3ffe3bd48e1cd6edc912dff77e39ba1a14999b5e00ec68614b311c';
const abiMinter = JSON.parse(fs.readFileSync("./abi/minter-abi.json", "utf8"));



async function main() {
    /*
    - ETH: First 500 Unique addresses to mint
    - MATIC: First 2500 Unique addresses to mint
    - BSC: First 1500 Unique addresses to mint
    - AVAX: First 1500 Unique addresses to mint
    - FTM: First 2500 Unique addresses to mint
    * */

    await processChain(1500, 'bsc', '25208900');
    await processChain(1500, 'avalanche', '25570246');
    await processChain(2500, 'polygon', '38669109');
    await processChain(2500, 'fantom', '54668080');
    await processChain(500, 'eth', '16513351');

}
async function processChain(maxUsers, chainName, mainBlockStart){
    console.log(`Scanning ${chainName} for ${maxUsers} first minters.`);
    mainBlockStart = parseInt(mainBlockStart);
    const web3 = new Web3(`https://rpc.ankr.com/${chainName}/${process.env.ANKR}`);
    const lastBlock = parseInt(await web3.eth.getBlockNumber());;
    try {
        await scanBlockchain(web3, chainName, mainBlockStart, lastBlock, maxUsers);
    }catch(e){
        console.log(`Error running the chain ${chainName} scan: ${e.toString()}`);
    }
}
async function scanBlockchain(web3, chainName, mainBlockStart, lastBlock, maxUsers) {
    let size = 30, users = [];
    let finishProcessing = false;
    mainBlockStart = parseInt(mainBlockStart)
    lastBlock = parseInt(lastBlock)
    console.log(`mainBlockStart=${mainBlockStart} lastBlock=${lastBlock}`)
    for (let i = mainBlockStart; i < lastBlock; i += size) {
        console.log(`${i}@${chainName} (${users.length} of ${maxUsers})`)
        if( finishProcessing ){
            console.log(`1) maxUsers ${maxUsers} reached for chain ${chainName}`);
            break;
        }
        // await new Promise(resolve => setTimeout(resolve, 1000));
        const from = i;
        const to = (i + size) - 1;
        try {
            const params = {blockchain: chainName, fromBlock: from, toBlock: to};
            const blocks = await provider.getBlocks(params);

            for( let i in blocks.blocks ) {
                const block = blocks.blocks[i]
                for( let j in block.transactions ) {
                    const transaction = block.transactions[j];
                    for( let l in transaction.logs ){
                        const log = transaction.logs[l];
                        if( log.topics.indexOf(claimRankTopic) !== -1 ) {
                            const user = transaction.from;
                            const minter = new web3.eth.Contract(abiMinter, user);
                            let owner;
                            try{
                                owner = await minter.owner();
                            }catch(e){
                                // console.log(user, e.toString());
                            }
                            if( owner && users.indexOf(owner) === -1 ){
                                users.push(owner);
                            }else if( users.indexOf(user) === -1 ){
                                users.push(user);
                            }
                            console.log(` ${user}=${owner} (${users.length})`)
                        }
                    }
                    if( users.length >= maxUsers ){
                        console.log(`3) maxUsers ${maxUsers} reached for chain ${chainName}`);
                        finishProcessing = true;
                    }
                }
            }
        }catch(e){
            console.log(e.toString());
        }
    }

    const file = `./data/${chainName}.txt`;
    console.log(users.length, file);
    fs.writeFileSync(file, users.join('\n') );
}

main();
