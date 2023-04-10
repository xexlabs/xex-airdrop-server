'use strict'
const fs = require('fs');
let mainnet = [], testnet = [];

async function main() {
    /*
    - ETH: First 500 Unique addresses to mint
    - MATIC: First 2500 Unique addresses to mint
    - BSC: First 1500 Unique addresses to mint
    - AVAX: First 1500 Unique addresses to mint
    - FTM: First 2500 Unique addresses to mint
    * */
    await processChain(1500, 'bsc', '56', '97');
    await processChain(1500, 'avax', '43114', '43113');
    await processChain(2500, 'matic', '137', '80001');
    await processChain(2500, 'ftm', '250', '4002');
    await processChain(500, 'eth', '1', '5');
    await wl(0, 'eth', '1', '5');
    fs.writeFileSync('../xex-wl-server/data/mainnet.txt', mainnet.join("\n"));
    fs.writeFileSync('../xex-wl-server/data/testnet.txt', testnet.join("\n"));
}

async function processChain(maxUsers, chainName, chainIdMainnet, chainIdTestnet) {
    const csv = fs.readFileSync(`./mainnet-data/${chainName}.csv`).toString('utf-8').split("\n");
    for (let i = 1; i < csv.length; i++) {
        const line = csv[i].split(",");
        let address = line[0];
        if (!address) continue;
        address = address.replaceAll('"', '');
        if (address.length !== 42) continue;
        if (i >= maxUsers) break;
        mainnet.push(`${address},${chainIdMainnet}`);
        testnet.push(`${address},${chainIdTestnet}`);
    }
}

async function wl(maxUsers, chainName, chainIdMainnet, chainIdTestnet) {
    const files = fs.readdirSync(`./eth`)
    for( let i in files ) {
        const csv = fs.readFileSync(`./eth/${files[i]}`).toString('utf-8').split("\n");
        for (let i = 1; i < csv.length; i++) {
            const line = csv[i].split(",");
            let address = line[0];
            if (!address) continue;
            address = address.replaceAll('"', '');
            if (address.length !== 42 || address.indexOf('0x') === -1) continue;
            if (maxUsers > 0 && i >= maxUsers) break;
            mainnet.push(`${address},${chainIdMainnet}`);
            testnet.push(`${address},${chainIdTestnet}`);
        }
    }
}


main();
