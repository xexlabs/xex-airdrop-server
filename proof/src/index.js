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

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
	'Access-Control-Max-Age': '86400',
};

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
	return {error: `proof not found.`};
}

function handleOptions(request) {
	// Make sure the necessary headers are present
	// for this to be a valid pre-flight request
	let headers = request.headers;
	if (
		headers.get('Origin') !== null &&
		headers.get('Access-Control-Request-Method') !== null &&
		headers.get('Access-Control-Request-Headers') !== null
	) {
		// Handle CORS pre-flight request.
		// If you want to check or reject the requested method + headers
		// you can do that here.
		let respHeaders = {
			...corsHeaders,
			// Allow all future content Request headers to go back to browser
			// such as Authorization (Bearer) or X-Client-Name-Version
			'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
		};

		return new Response(null, {
			headers: respHeaders,
		});
	} else {
		// Handle standard OPTIONS request.
		// If you want to allow other HTTP Methods, you can do that here.
		return new Response(null, {
			headers: {
				Allow: 'GET, HEAD, POST, OPTIONS',
			},
		});
	}
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
			if (request.method === 'OPTIONS') {
				return handleOptions(request);
			} else if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'POST') {
				const { searchParams } = new URL(request.url)
				let wallet = searchParams.get('wallet')
				const r = checkProof(wallet);
				return new Response( JSON.stringify(r));
			} else {
					return new Response(null, {
						status: 405,
						statusText: 'Method Not Allowed',
					})
			}
	},
};
