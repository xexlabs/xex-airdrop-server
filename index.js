"use strict";
process.on('uncaughtException', function (err) {
    console.error('[uncaughtException]', err);
    // process.exit(0);
});
process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 0;

require('dotenv').config({path: '.env'});
const merkle = require("@openzeppelin/merkle-tree");
const fs = require('fs')
const chalk = require('chalk');
const {v4: uuidv4} = require('uuid');
const magenta = function () {
    console.log(chalk.magenta(...arguments))
};
const cyan = function () {
    console.log(chalk.cyan(...arguments))
};
const yellow = function () {
    console.log(chalk.yellow(...arguments))
};
const red = function () {
    console.log(chalk.red(...arguments))
};
const blue = function () {
    console.log(chalk.blue(...arguments))
};
const green = function () {
    console.log(chalk.green(...arguments))
};

const express = require('express')
const app = express()
const cors = require('cors');

// CORS
app.use(cors());
app.set('trust proxy', 1); // trust first proxy
app.set('json spaces', 40);
app.set('view engine', 'ejs');
app.use(express.static('public_html'))
let MerkleTreeData;

const networkInfo = {
    "97": "bsc-testnet",
    "43113": "avax-testnet",
    "5": "eth-testnet",
    "80001": "polygon-testnet",
    "4002": "ftm-testnet",
}


function checkProof(address) {
    if (!address) {
        red(`invalid address.`);
        return {};
    }
    const wallet = address.toLowerCase();
    green(`- check proof for ${wallet}...`)
    for (const [i, v] of MerkleTreeData.entries()) {
        if (v[0] === wallet) {
            const proof = MerkleTreeData.getProof(i);
            const networkId = v[1];
            const networkName = networkInfo[networkId];
            green(`  proof found at ${i}, network: ${networkName} (${networkId}).`);
            return {networkId: networkId, networkName: networkName, proof: proof};
        }
    }
    yellow(`  proof not found for wallet ${wallet}...`)
    return {};
}

app.get('/proof/:wallet', function (req, res) {
    const wallet = req.params.wallet.toLowerCase();
    return res.json( checkProof(wallet) );
});

app.use(express.static('./public_html'));

async function http(port) {
    app.listen(port, () => {
        console.log(`http://127.0.0.1:${port}`);
    });
}

async function generate(isTestnet) {
    const file = isTestnet ? './data/testnet.txt' : './data/mainnet.txt';
    const fileData = fs.readFileSync(file).toString().trim().split('\n');
    let airdrop_data = [];
    let testWalletAddress;
    for (let i in fileData) {
        const lineData = fileData[i].trim();
        if (!lineData) {
            red(`Invalid line at ${i}`);
            continue;
        }
        const userData = lineData.split(',');
        airdrop_data.push([userData[0].toLowerCase(), userData[1]]);
        if (!testWalletAddress)
            testWalletAddress = userData[0].toLowerCase();
    }
    const tree = merkle.StandardMerkleTree.of(airdrop_data, ["address", "uint256"]);
    MerkleTreeData = merkle.StandardMerkleTree.load(tree.dump());
    cyan(`- airdrop config:`);
    cyan(`  * root: ${MerkleTreeData.root}`);
    cyan(`  * addresses: ${fileData.length}`);
    checkProof(testWalletAddress);
}

async function main() {
    await generate(true);
    await http(8182);
}

main();
