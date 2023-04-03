const fetch = require('node-fetch');
const {expect} = require('@jest/globals');

describe("Worker", () => {
	it("return a proof", async () => {
		const q = '?wallet=0x78B3Ec25D285F7a9EcA8Da8eb6b20Be4d5D70E84';
		const res = await fetch(`https://127.0.0.1:8787/${q}`);
		const r = await res.json();
		console.log(r);
		// expect(r.networkId).toBe('97');
		// expect(r.networkName).toBe('bsc-testnet');
		// expect(r.proof.length).toBe(5);
	});

	/*
	it("return a proof", async () => {
		const q = '?wallet=0x78B3Ec25D285F7a9EcA8Da8eb6b20Be4d5D70E84';
		const o = {
			'method': 'OPTIONS',
			'Access-Control-Request-Method': '*',
			'Access-Control-Request-Headers': '*',
		};
		const res = await fetch(`http://127.0.0.1:8787/${q}`, o);
		expect( res.headers.get('access-control-allow-origin') ).toBe('*');

		const proofResponse = await fetch(`http://127.0.0.1:8787/${q}`);
		const proofData = await proofResponse.json();
		console.log( proofData);
	});
	*/
});
