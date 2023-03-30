'use strict'
const fs = require('fs');
let mainnet = [];

async function main() {
    /*
    - ETH: First 500 Unique addresses to mint
    - MATIC: First 2500 Unique addresses to mint
    - BSC: First 1500 Unique addresses to mint
    - AVAX: First 1500 Unique addresses to mint
    - FTM: First 2500 Unique addresses to mint
    * */
    await processChain(1500, 'bsc', '56');
    await processChain(1500, 'avax', '42161');
    await processChain(2500, 'matic', '137');
    await processChain(2500, 'ftm', '250');
    await processChain(500, 'eth', '1');
    fs.writeFileSync('../proof/src/data/mainnet.txt', mainnet.join("\n"));
}

async function processChain(maxUsers, chainName, chainId) {
    const csv = fs.readFileSync(`./mainnet-data/${chainName}.csv`).toString('utf-8').split("\n");
    for (let i = 1; i < csv.length; i++) {
        const line = csv[i].split(",");
        let address = line[0];
        if( ! address ) continue;
        address = address.replaceAll('"', '');
        if (address.length !== 42) continue;
        if (i >= maxUsers) break;
        mainnet.push(`${address},${chainId}`);
    }
}


main();
