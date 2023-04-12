'use strict';
const merkle = require("@openzeppelin/merkle-tree");
const dataFileTestnet = './data/testnet.txt';
const dataFileMainnet = './data/mainnet.txt';
let MerkleTreeTestnetData;
let MerkleTreeMainnetData;
const express = require('express')
const app = express()
const port = 8787
const fs = require('fs');
const cors = require('cors');
const networkInfo = {
    "97": "bsc-testnet",
    "43113": "avax-testnet",
    "5": "eth-testnet",
    "80001": "polygon-testnet",
    "4002": "ftm-testnet",

    "56": "bsc",
    "42161": "avax",
    "1": "eth",
    "137": "polygon",
    "250": "ftm",
}

function checkProof(address, mainnet) {
    if (!address) {
        return {error: `invalid address.`};
    }
    const wallet = address.toLowerCase();
    const tree = mainnet ? MerkleTreeMainnetData : MerkleTreeTestnetData;
    for (const [i, v] of tree.entries()) {
        if (v[0] === wallet) {
            const proof = tree.getProof(i);
            const networkId = v[1];
            const networkName = networkInfo[networkId];
            console.log(` ${wallet} proof found at ${i}, network: ${networkName} (${networkId}).`);
            return {networkId: networkId, networkName: networkName, proof: proof};
        }
    }
    return {proof: []};
}


app.use(cors())
app.get('/testnet', function (req, res) {
    const wallet = req.query.wallet;
    const proof = checkProof(wallet, false);
    return res.json(proof);
});
app.get('/mainnet', function (req, res) {
    const wallet = req.query.wallet;
    const proof = checkProof(wallet, true);
    return res.json(proof);
});

function buildMerkleTree(file) {
    const rawData = fs.readFileSync(file).toString('utf-8');
    const fileData = rawData.trim().split('\n');
    let airdrop_data = [];
    for (let i in fileData) {
        const lineData = fileData[i].trim();
        if (!lineData) {
            console.log(`Invalid line at ${i}`);
            continue;
        }
        const userData = lineData.split(',');
        airdrop_data.push([userData[0].toLowerCase(), userData[1]]);
    }
    const tree = merkle.StandardMerkleTree.of(airdrop_data, ["address", "uint256"]);
    console.log(file, tree.root);
    return merkle.StandardMerkleTree.load(tree.dump());
}

app.listen(port, () => {
    MerkleTreeTestnetData = buildMerkleTree(dataFileTestnet);
    MerkleTreeMainnetData = buildMerkleTree(dataFileMainnet);
})