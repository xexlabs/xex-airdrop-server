'use strict'
const fs = require('fs');
const Web3 = require('web3');
const dotenv = require("dotenv");
dotenv.config()

const mainAddress = '0xa41A879bcFdd75983a987FD6b68fae37777e8b28';
const abiMain = JSON.parse(fs.readFileSync("./abi/main-abi.json", "utf8"));
const abiMinter = JSON.parse(fs.readFileSync("./abi/minter-abi.json", "utf8"));



async function processChain(maxUsers, chainName, rpc, mainBlockStart, factoryBlockStart){
    console.log(`Scanning ${chainName} for ${maxUsers} first minters.`);
    const web3 = new Web3(rpc);
    const main = new web3.eth.Contract(abiMain, mainAddress);
    const lastBlock = parseInt(await web3.eth.getBlockNumber());
    try {
        await scanBlockchain(web3, chainName, main, mainBlockStart, lastBlock, maxUsers);
    }catch(e){
        console.log(`Error running the chain ${chainName} scan: ${e.toString()}`);
    }
}
async function main() {
    /*
    - ETH: First 500 Unique addresses to mint
    - MATIC: First 2500 Unique addresses to mint
    - BSC: First 1500 Unique addresses to mint
    - AVAX: First 1500 Unique addresses to mint
    - FTM: First 2500 Unique addresses to mint
    * */

    // await processChain(1500, 'bsc',`https://rpc.ankr.com/bsc/${process.env.ANKR}`, '25208900', '25208912');
    // await processChain(1500, 'avalanche',`https://rpc.ankr.com/avalanche/${process.env.ANKR}`, '25570246', '25570259');
    // await processChain(2500, 'polygon',`https://rpc.ankr.com/polygon/${process.env.ANKR}`, '38669109', '38669138');
    // await processChain(2500, 'fantom',`https://rpc.ankr.com/fantom/${process.env.ANKR}`, '54668080', '54668094');
    await processChain(500, 'ethereum',`https://mainnet.infura.io/v3/${process.env.INFURA}`, '16513351', '16513362');


}




async function scanBlockchain(web3, chainName, main, mainBlockStart, lastBlock, maxUsers) {
    let size = 1000, users = [];
    let finishProcessing = false;
    for (let i = mainBlockStart; i < lastBlock; i += size) {
        if( finishProcessing ){
            console.log(`1) maxUsers ${maxUsers} reached for chain ${chainName}`);
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        const from = i;
        const to = (i + size) - 1;
        try {
            // emit RankClaimed(msg.sender, term, globalRank++, getCurrentAMP(), mintInfo.eaaRate, mintInfo.maturityTs);
            await main.getPastEvents({fromBlock: from, toBlock: to},
                async function(error, events){
                    if (error) {
                        console.log(error.toString());
                    } else {
                        for (let j = 0; j < events.length; j++) {
                            const e = events[j];
                            if (!e.event) continue;
                            if (e.event != 'RankClaimed') continue;
                            if( users.length >= maxUsers ){
                                finishProcessing = true;
                                console.log(`2) maxUsers ${maxUsers} reached for chain ${chainName}`);
                                return;
                            }
                            // event RankClaimed(address indexed user, uint256 term, uint256 rank, uint AMP, uint EAA, uint maturity);
                            // emit RankClaimed(msg.sender, term, globalRank++, getCurrentAMP(), mintInfo.eaaRate, mintInfo.maturityTs);
                            const user = e.returnValues.user;
                            const minter = new web3.eth.Contract(abiMinter, user);
                            try{
                                const owner = await minter.owner();
                                if( owner && users.indexOf(owner) === -1 ){
                                    users.push(users);
                                }else if( user && users.indexOf(user) === -1 ){
                                    users.push(users);
                                }
                                if( users.length >= maxUsers ){
                                    console.log(`3) maxUsers ${maxUsers} reached for chain ${chainName}`);
                                    finishProcessing = true;
                                }
                            }catch(e){
                                console.log(user, e.toString());
                            }
                        }
                    }
                }
            );
        }catch(e){
            console.log(e.toString());
        }
    }
    fs.writeFileSync(`./data/${chainName}.txt`, users.join('\n') );
}

main();
