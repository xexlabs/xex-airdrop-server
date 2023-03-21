'use strict';
const merkle = require("@openzeppelin/merkle-tree");
import dataTestnet from './data/testnet.txt';

const networkInfo = {
    "97": "bsc-testnet",
    "43113": "avax-testnet",
    "5": "eth-testnet",
    "80001": "polygon-testnet",
    "4002": "ftm-testnet",
}

function checkProof(address) {
    if (!address) {
        return {error: `invalid address.`};
    }
    const fileData = dataTestnet.trim().split('\n');
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
    //console.log('root', tree.root);
    const MerkleTreeData = merkle.StandardMerkleTree.load(tree.dump());

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

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        //console.log(request.method, url);
        if (request.method === 'OPTIONS') {
            let respHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
                'Access-Control-Max-Age': '86400',
                'Access-Control-Allow-Headers': '*',
            };
            return new Response(null, {
                headers: respHeaders,
                Allow: 'GET, HEAD, POST, OPTIONS',
            });
        } else if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'POST') {
            const {searchParams} = new URL(request.url)
            const wallet = searchParams.get('wallet')
            const proof = JSON.stringify(checkProof(wallet));
            const response = new Response(proof);
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.append('Vary', 'Origin');
            return response;
        } else {
            return new Response(null, {
                status: 405,
                statusText: 'Method Not Allowed',
            })
        }
    },
};
