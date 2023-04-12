'use strict'
const fs = require('fs');
let mainnet = [], testnet = [], allAddresses = [];
let totalsInfo = [];
async function main() {
    await processMinters(1500, 'bsc', '56', '97');
    await processMinters(1500, 'avax', '43114', '43113');
    await processMinters(2500, 'polygon', '137', '80001');
    await processMinters(2500, 'ftm', '250', '4002');
    await processMinters(500, 'eth', '1', '5');

    await fromWhitelist(0, 'eth', '1', '5', 'Denied');
    await fromWhitelist(0, 'polygon', '137', '80001', 'Denied');

    fs.writeFileSync('../xex-wl-server/data/mainnet.txt', mainnet.join("\n"));
    fs.writeFileSync('../xex-wl-server/data/testnet.txt', testnet.join("\n"));

    totalsInfo.push(`- TOTAL: ${mainnet.length}`)

    const README = totalsInfo.join('\n');
    console.log(README);
    fs.writeFileSync('../README.md', README);


}

async function processMinters(maxUsers, chainName, chainIdMainnet, chainIdTestnet) {
    const csv = fs.readFileSync(`./minters/${chainName}.csv`).toString('utf-8').split("\n");
    let total = 0;
    for (let i = 1; i < csv.length; i++) {
        const line = csv[i].split(",");
        let address = line[0];
        if (!address) continue;
        address = address.replaceAll('"', '');
        address = address.trim();
        if (address.length !== 42) continue;
        if (i >= maxUsers) break;
        const mainetEntry = `${address},${chainIdMainnet}`;
        const testnetEntry = `${address},${chainIdTestnet}`
        if( allAddresses.indexOf(address) !== -1 ) continue;
        mainnet.push(mainetEntry);
        testnet.push(testnetEntry);
        allAddresses.push(address);
        ++total;
    }
    totalsInfo.push(`- minters: ${chainName} = ${total}`)
}

async function fromWhitelist(maxUsers, chainName, chainIdMainnet, chainIdTestnet, filter) {
    const files = fs.readdirSync(`./wl/${chainName}`);
    let total = 0;
    for( let i in files ) {
        const csv = fs.readFileSync(`./wl/${chainName}/${files[i]}`).toString('utf-8').split("\n");
        for (let i = 1; i < csv.length; i++) {
            const line = csv[i].split(",");
            if( filter && line.indexOf(filter) !== -1 )
                continue;
            let address = line[0];
            if (!address) continue;
            address = address.replaceAll('"', '');
            address = address.trim();
            if (address.length !== 42 || address.indexOf('0x') === -1) continue;
            if (maxUsers > 0 && i >= maxUsers) break;
            const mainetEntry = `${address},${chainIdMainnet}`;
            const testnetEntry = `${address},${chainIdTestnet}`
            if( allAddresses.indexOf(address) !== -1 ) continue;
            mainnet.push(mainetEntry);
            testnet.push(testnetEntry);
            allAddresses.push(address);
            ++total;
        }
    }
    totalsInfo.push(`- wl: ${chainName} = ${total}`)
}


main();
