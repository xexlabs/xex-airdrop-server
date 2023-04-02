'use strict';
const merkle = require("@openzeppelin/merkle-tree");
const dataFile = './data/testnet.txt';
let MerkleTreeData;
const express = require('express')
const app = express()
const port = 8787
const fs = require('fs');
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

function checkProof(address) {
    if (!address) {
        return {error: `invalid address.`};
    }
    const wallet = address.toLowerCase();
    for (const [i, v] of MerkleTreeData.entries()) {
        if (v[0] === wallet) {
            const proof = MerkleTreeData.getProof(i);
            const networkId = v[1];
            const networkName = networkInfo[networkId];
            console.log(`  proof found at ${i}, network: ${networkName} (${networkId}).`);
            return {networkId: networkId, networkName: networkName, proof: proof};
        }
    }
    return {proof: []};
}



app.get('/', function(req, res){
    const wallet = req.query.wallet;
    const proof = checkProof(wallet);
    return res.json(proof);
});

app.listen(port, () => {
    const rawData = fs.readFileSync(dataFile).toString('utf-8');
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
    console.log('root', tree.root);
    MerkleTreeData = merkle.StandardMerkleTree.load(tree.dump());
})