'use strict'
const fs = require('fs');
const Web3 = require('web3');
const dotenv = require("dotenv");
dotenv.config()

const mainAddress = '0xa41A879bcFdd75983a987FD6b68fae37777e8b28';
const factoryAddress = '0xA54108A0413f9992dFad7873966fF55d95EBcf7b';
const abiMain = JSON.parse(fs.readFileSync("./abi/main-abi.js", "utf8"));
const abiFactory = JSON.parse(fs.readFileSync("./abi/factory-abi.js", "utf8"));

async function processChain(chainName, rpc, mainBlockStart, factoryBlockStart){
    /*
    - ETH: First 500 Unique addresses to mint
    - MATIC: First 2500 Unique addresses to mint
    - BSC: First 1500 Unique addresses to mint
    - AVAX: First 1500 Unique addresses to mint
    - FTM: First 2500 Unique addresses to mint
    * */
    const web3 = new Web3(rpc);
    const main = new web3.eth.Contract(abiMain, mainAddress);
    const factory = new web3.eth.Contract(abiFactory, factoryAddress);
    const lastBlock = parseInt(await web3.eth.getBlockNumber());
    /*
    try {
        await scanBlockchain(blocks.BLOCK_START, blocks.BLOCK_END);
    }catch(e){
        console.log(`Error running the chain ${chainName} scan: ${e.toString()}`);
    }
    */
}
async function main() {
    await processChain('bsc',`https://rpc.ankr.com/bsc/${process.env.ANKR}`, '25208900', '25208912');
    await processChain('avalanche',`https://rpc.ankr.com/avalanche/${process.env.ANKR}`, '25570246', '25570259');
    await processChain('polygon',`https://rpc.ankr.com/polygon/${process.env.ANKR}`, '38669109', '38669138');
    await processChain('fantom',`https://rpc.ankr.com/fantom/${process.env.ANKR}`, '54668080', '54668094');
    await processChain('ethereum',`https://mainnet.infura.io/v3/${process.env.INFURA}`, '16513351', '16513362');
    await processChain('arbitrum',`https://arb1.arbitrum.io/rpc`, '65115100', '65115132');


}


async function onNewEvent(error, events){
    if (error) {
        console.log(error.toString());
    } else {
        for (let j = 0; j < events.length; j++) {
            const e = events[j];
            if (!e.event) continue;
            if (e.event != 'Deposit') continue;
            const u = e.returnValues;
            console.log(u);
        }
    }

}

async function scanBlockchain(ctx, start, end, file) {
    let size = 1000, lines = [];
    for (let i = start; i < end; i += size) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const from = i;
        const to = (i + size) - 1;
        try {
            await ctx.getPastEvents({fromBlock: from, toBlock: to}, onNewEvent);
        }catch(e){
            console.log(e.toString());
        }
    }
    // fs.writeFileSync(file, info.join('\n') );
}

main();
