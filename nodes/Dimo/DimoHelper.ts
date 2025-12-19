import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import * as crypto from 'crypto';

export interface DimoApiCredentials {
	clientId: string;
	redirectUri: string;
	apiKey: string;
	environment: string;
}

// Helper function for modular exponentiation
function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
	if (modulus === 1n) return 0n;
	let result = 1n;
	base = base % modulus;
	while (exponent > 0n) {
		if (exponent % 2n === 1n) {
			result = (result * base) % modulus;
		}
		exponent = exponent / 2n;
		base = (base * base) % modulus;
	}
	return result;
}

export class DimoHelper {
	credentials: DimoApiCredentials;
	executeFunctions: IExecuteFunctions;

	constructor(executeFunctions: IExecuteFunctions, credentials: DimoApiCredentials) {
		this.executeFunctions = executeFunctions;
		this.credentials = credentials;
	}

	get basePath(): string {
		return this.credentials.environment === 'Dev'
			? 'https://auth.dev.dimo.zone'
			: 'https://auth.dimo.zone';
	}

	get nftAddress(): string {
		return this.credentials.environment === 'Dev'
			? '0x45fbCD3ef7361d156e8b16F5538AE36DEdf61Da8'
			: '0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF';
	}

	checkRedirectUri(): void {
		if (
			!this.credentials.redirectUri.startsWith('http://') &&
			!this.credentials.redirectUri.startsWith('https://')
		) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Redirect URI must include the protocol - e.g. http:// or https://',
			);
		}
	}

	async generateChallenge(): Promise<{ challenge: string; state: string }> {
		const requestBody = new URLSearchParams({
			client_id: this.credentials.clientId,
			domain: this.credentials.redirectUri,
			scope: 'openid email',
			response_type: 'code',
			address: this.credentials.clientId,
		}).toString();

		console.log('[DIMO] Generating challenge with:', {
			clientId: this.credentials.clientId,
			redirectUri: this.credentials.redirectUri,
			basePath: this.basePath,
		});

		const challengeResponse = await this.executeFunctions.helpers.request({
			method: 'POST',
			url: `${this.basePath}/auth/web3/generate_challenge`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json',
				'User-Agent': 'dimo-n8n',
			},
			body: requestBody,
		});

		const parsedResponse =
			typeof challengeResponse === 'string' ? JSON.parse(challengeResponse) : challengeResponse;

		console.log('[DIMO] Challenge received:', {
			hasChallenge: !!parsedResponse?.challenge,
			challengeLength: parsedResponse?.challenge?.length || 0,
			state: parsedResponse?.state,
		});

		if (!parsedResponse?.challenge) {
			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				'Challenge was not found in the response',
			);
		}

		return parsedResponse;
	}

	/**
	 * Keccak-256 hash function for Ethereum compatibility
	 * This is a self-contained implementation without external dependencies
	 */
	private keccak256(input: Buffer): Buffer {
		const RC = [
			0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
			0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
			0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
			0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
			0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
			0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
		];

		const r = [
			[0, 36, 3, 41, 18],
			[1, 44, 10, 45, 2],
			[62, 6, 43, 15, 61],
			[28, 55, 25, 21, 56],
			[27, 20, 39, 8, 14],
		];

		const rotateLeft = (n: bigint, rotate: number): bigint => {
			return ((n << BigInt(rotate)) | (n >> BigInt(64 - rotate))) & 0xffffffffffffffffn;
		};

		const keccakF = (s: bigint[]): void => {
			for (let round = 0; round < 24; round++) {
				// Theta
				const c: bigint[] = Array(5).fill(0n);
				for (let i = 0; i < 5; i++) {
					c[i] = s[i] ^ s[i + 5] ^ s[i + 10] ^ s[i + 15] ^ s[i + 20];
				}
				const d: bigint[] = Array(5).fill(0n);
				for (let i = 0; i < 5; i++) {
					d[i] = c[(i + 4) % 5] ^ rotateLeft(c[(i + 1) % 5], 1);
				}
				for (let i = 0; i < 25; i++) {
					s[i] ^= d[i % 5];
				}

				// Rho and Pi
				const b: bigint[] = Array(25).fill(0n);
				for (let i = 0; i < 5; i++) {
					for (let j = 0; j < 5; j++) {
						b[j + ((2 * i + 3 * j) % 5) * 5] = rotateLeft(s[i + j * 5], r[j][i]);
					}
				}

				// Chi
				for (let i = 0; i < 5; i++) {
					for (let j = 0; j < 5; j++) {
						s[i + j * 5] = b[i + j * 5] ^ (~b[((i + 1) % 5) + j * 5] & b[((i + 2) % 5) + j * 5]);
					}
				}

				// Iota
				s[0] ^= RC[round];
			}
		};

		// Pad input
		const rate = 136; // For Keccak-256
		const inputLength = input.length;
		const blockSize = rate;
		const paddingLen = blockSize - (inputLength % blockSize);
		const padded = Buffer.alloc(inputLength + paddingLen);
		input.copy(padded);
		padded[inputLength] = 0x01;
		padded[padded.length - 1] |= 0x80;

		// Initialize state
		const state: bigint[] = Array(25).fill(0n);

		// Absorb
		for (let i = 0; i < padded.length; i += blockSize) {
			for (let j = 0; j < blockSize / 8; j++) {
				const idx = i + j * 8;
				if (idx + 8 <= padded.length) {
					state[j] ^= padded.readBigUInt64LE(idx);
				}
			}
			keccakF(state);
		}

		// Squeeze
		const output = Buffer.alloc(32);
		for (let i = 0; i < 4; i++) {
			output.writeBigUInt64LE(state[i], i * 8);
		}

		return output;
	}

	/**
	 * Derive public key from private key for secp256k1
	 */
	private derivePublicKey(privateKeyBuffer: Buffer): { x: Buffer; y: Buffer } {
		// secp256k1 curve parameters
		const p = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
		const Gx = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n;
		const Gy = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n;

		// Convert private key to BigInt
		const privateKeyBigInt = BigInt('0x' + privateKeyBuffer.toString('hex'));

		// Modular arithmetic helpers
		const modPow = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
			if (modulus === 1n) return 0n;
			let result = 1n;
			base = base % modulus;
			while (exponent > 0n) {
				if (exponent % 2n === 1n) result = (result * base) % modulus;
				exponent = exponent / 2n;
				base = (base * base) % modulus;
			}
			return result;
		};

		const modInverse = (a: bigint, m: bigint): bigint => {
			return modPow(a, m - 2n, m);
		};

		// Point doubling and addition for elliptic curve
		const pointDouble = (x: bigint, y: bigint): { x: bigint; y: bigint } => {
			const s = (3n * x * x * modInverse(2n * y, p)) % p;
			const xNew = (s * s - 2n * x) % p;
			const yNew = (s * (x - xNew) - y) % p;
			return { x: (xNew + p) % p, y: (yNew + p) % p };
		};

		const pointAdd = (
			x1: bigint,
			y1: bigint,
			x2: bigint,
			y2: bigint,
		): { x: bigint; y: bigint } => {
			if (x1 === x2 && y1 === y2) return pointDouble(x1, y1);
			const s = ((y2 - y1) * modInverse((x2 - x1 + p) % p, p)) % p;
			const xNew = (s * s - x1 - x2) % p;
			const yNew = (s * (x1 - xNew) - y1) % p;
			return { x: (xNew + p) % p, y: (yNew + p) % p };
		};

		// Scalar multiplication using double-and-add
		let result = { x: 0n, y: 0n };
		let addend = { x: Gx, y: Gy };
		let k = privateKeyBigInt;

		let firstPoint = true;
		while (k > 0n) {
			if (k % 2n === 1n) {
				if (firstPoint) {
					result = addend;
					firstPoint = false;
				} else {
					result = pointAdd(result.x, result.y, addend.x, addend.y);
				}
			}
			addend = pointDouble(addend.x, addend.y);
			k = k / 2n;
		}

		// Convert to 32-byte buffers
		const xHex = result.x.toString(16).padStart(64, '0');
		const yHex = result.y.toString(16).padStart(64, '0');

		return {
			x: Buffer.from(xHex, 'hex'),
			y: Buffer.from(yHex, 'hex'),
		};
	}

	/**
	 * Sign an Ethereum message using secp256k1 curve
	 * Implements Ethereum's personal_sign standard
	 */
	async signChallenge(challenge: string): Promise<string> {
		console.log('[DIMO] Starting signature process');
		console.log('[DIMO] Challenge to sign:', challenge);

		let apiKey = this.credentials.apiKey;
		if (!apiKey.startsWith('0x')) {
			apiKey = '0x' + apiKey;
		}

		// Remove '0x' prefix for processing
		const privateKeyHex = apiKey.slice(2);
		const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');

		console.log('[DIMO] Private key length:', privateKeyBuffer.length, 'bytes');

		// Derive public key
		const publicKeyCoords = this.derivePublicKey(privateKeyBuffer);
		const publicKeyUncompressed = Buffer.concat([
			Buffer.from([0x04]), // Uncompressed prefix
			publicKeyCoords.x,
			publicKeyCoords.y
		]);
		console.log('[DIMO] Public key derived:', {
			x: publicKeyCoords.x.toString('hex').substring(0, 16) + '...',
			y: publicKeyCoords.y.toString('hex').substring(0, 16) + '...',
		});

		// Calculate Ethereum address from public key (last 20 bytes of keccak256 hash)
		const publicKeyHash = this.keccak256(publicKeyUncompressed.subarray(1)); // Skip 0x04 prefix
		const expectedAddress = '0x' + publicKeyHash.subarray(12).toString('hex');
		console.log('[DIMO] Expected Ethereum address:', expectedAddress);

		// Ethereum signed message prefix
		const messagePrefix = '\x19Ethereum Signed Message:\n';
		const messageBuffer = Buffer.from(challenge, 'utf8');
		const prefixBuffer = Buffer.from(messagePrefix + messageBuffer.length.toString(), 'utf8');

		// Concatenate prefix and message
		const fullMessage = Buffer.concat([prefixBuffer, messageBuffer]);
		console.log('[DIMO] Full message to hash:', fullMessage.toString('hex').substring(0, 40) + '...');

		// Hash the message with Keccak-256
		const messageHash = this.keccak256(fullMessage);
		console.log('[DIMO] Message hash (Keccak-256):', messageHash.toString('hex'));

		// Create ECDSA private key object for secp256k1 with complete JWK
		const privateKey = crypto.createPrivateKey({
			key: {
				crv: 'secp256k1',
				d: privateKeyBuffer.toString('base64url'),
				x: publicKeyCoords.x.toString('base64url'),
				y: publicKeyCoords.y.toString('base64url'),
				kty: 'EC',
			},
			format: 'jwk',
		});

		// Sign the message hash
		const signature = crypto.sign(null, messageHash, {
			key: privateKey,
			dsaEncoding: 'ieee-p1363',
		});

		console.log('[DIMO] Raw signature length:', signature.length, 'bytes');

		// Extract r and s components (32 bytes each)
		let r = signature.subarray(0, 32);
		let s = signature.subarray(32, 64);

		console.log('[DIMO] Signature r:', r.toString('hex'));
		console.log('[DIMO] Signature s (before normalization):', s.toString('hex'));

		// Normalize s to lower half (EIP-2 / BIP-62)
		const secp256k1N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
		let sBigInt = BigInt('0x' + s.toString('hex'));

		if (sBigInt > secp256k1N / 2n) {
			console.log('[DIMO] Normalizing s value to lower half');
			// Flip s to be in the lower half
			sBigInt = secp256k1N - sBigInt;
			const sHex = sBigInt.toString(16).padStart(64, '0');
			s = Buffer.from(sHex, 'hex');
		}

		console.log('[DIMO] Signature s (after normalization):', s.toString('hex'));

		// Calculate the correct recovery ID by testing both possibilities
		let recoveryId = 0;
		for (let i = 0; i < 2; i++) {
			const recoveredAddress = this.recoverAddress(messageHash, r, s, i);
			console.log(`[DIMO] Testing recovery ID ${i}: recovered address =`, recoveredAddress);
			if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
				recoveryId = i;
				console.log('[DIMO] Found matching recovery ID:', recoveryId);
				break;
			}
		}

		// Calculate v (recovery ID + 27 for Ethereum)
		const v = 27 + recoveryId;
		const vBuffer = Buffer.from([v]);

		console.log('[DIMO] Recovery ID (v):', v);

		// Concatenate r, s, v in Ethereum signature format
		const ethSignature = Buffer.concat([r, s, vBuffer]);
		const finalSignature = '0x' + ethSignature.toString('hex');

		console.log('[DIMO] Final signature:', finalSignature);
		console.log('[DIMO] Signature length:', finalSignature.length, 'chars (including 0x)');

		return finalSignature;
	}

	/**
	 * Recover Ethereum address from signature components
	 * This implements ECDSA public key recovery
	 */
	private recoverAddress(messageHash: Buffer, r: Buffer, s: Buffer, recoveryId: number): string {
		try {
			const secp256k1N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
			const secp256k1P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
			const Gx = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n;
			const Gy = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n;

			const rBigInt = BigInt('0x' + r.toString('hex'));
			const sBigInt = BigInt('0x' + s.toString('hex'));
			const eBigInt = BigInt('0x' + messageHash.toString('hex'));

			// Calculate x coordinate of R point (r + recoveryId * n)
			let x = rBigInt;
			if (recoveryId >= 2) {
				x = rBigInt + secp256k1N;
			}

			// Check if x is valid
			if (x >= secp256k1P) {
				return '0x0000000000000000000000000000000000000000';
			}

			// Calculate y coordinate from x using the curve equation y^2 = x^3 + 7
			const ySquared = (modPow(x, 3n, secp256k1P) + 7n) % secp256k1P;
			let y = modPow(ySquared, (secp256k1P + 1n) / 4n, secp256k1P);

			// Check if y has correct parity
			const yParity = recoveryId % 2;
			if ((y % 2n === 0n ? 0 : 1) !== yParity) {
				y = secp256k1P - y;
			}

			// Point multiplication helpers
			const modInverse = (a: bigint, m: bigint): bigint => {
				let [old_r, r] = [a, m];
				let [old_s, s] = [1n, 0n];

				while (r !== 0n) {
					const quotient = old_r / r;
					[old_r, r] = [r, old_r - quotient * r];
					[old_s, s] = [s, old_s - quotient * s];
				}

				return old_s < 0n ? old_s + m : old_s;
			};

			const pointAdd = (x1: bigint, y1: bigint, x2: bigint, y2: bigint): { x: bigint; y: bigint } => {
				if (x1 === x2 && y1 === y2) {
					const s = (3n * x1 * x1 * modInverse(2n * y1, secp256k1P)) % secp256k1P;
					const xNew = (s * s - 2n * x1) % secp256k1P;
					const yNew = (s * (x1 - xNew) - y1) % secp256k1P;
					return { x: (xNew + secp256k1P) % secp256k1P, y: (yNew + secp256k1P) % secp256k1P };
				}

				const s = ((y2 - y1) * modInverse((x2 - x1 + secp256k1P) % secp256k1P, secp256k1P)) % secp256k1P;
				const xNew = (s * s - x1 - x2) % secp256k1P;
				const yNew = (s * (x1 - xNew) - y1) % secp256k1P;
				return { x: (xNew + secp256k1P) % secp256k1P, y: (yNew + secp256k1P) % secp256k1P };
			};

			const pointMul = (k: bigint, px: bigint, py: bigint): { x: bigint; y: bigint } => {
				let result = { x: 0n, y: 0n };
				let addend = { x: px, y: py };
				let firstPoint = true;

				while (k > 0n) {
					if (k % 2n === 1n) {
						if (firstPoint) {
							result = addend;
							firstPoint = false;
						} else {
							result = pointAdd(result.x, result.y, addend.x, addend.y);
						}
					}
					addend = pointAdd(addend.x, addend.y, addend.x, addend.y);
					k = k / 2n;
				}

				return result;
			};

			// Recover public key: Q = r^-1 * (s*R - e*G)
			const rInv = modInverse(rBigInt, secp256k1N);

			// Calculate s*R
			const sR = pointMul(sBigInt, x, y);

			// Calculate e*G
			const eG = pointMul(eBigInt, Gx, Gy);

			// Calculate -e*G (negate y coordinate)
			const negEG = { x: eG.x, y: (secp256k1P - eG.y) % secp256k1P };

			// Calculate s*R - e*G
			const sRMinusEG = pointAdd(sR.x, sR.y, negEG.x, negEG.y);

			// Calculate r^-1 * (s*R - e*G)
			const Q = pointMul(rInv, sRMinusEG.x, sRMinusEG.y);

			// Convert to uncompressed public key
			const publicKeyUncompressed = Buffer.concat([
				Buffer.from([0x04]),
				Buffer.from(Q.x.toString(16).padStart(64, '0'), 'hex'),
				Buffer.from(Q.y.toString(16).padStart(64, '0'), 'hex')
			]);

			// Calculate Ethereum address (last 20 bytes of keccak256 of public key)
			const publicKeyHash = this.keccak256(publicKeyUncompressed.subarray(1));
			const address = '0x' + publicKeyHash.subarray(12).toString('hex');

			return address;
		} catch (error) {
			console.error('[DIMO] Error recovering address:', error);
			return '0x0000000000000000000000000000000000000000';
		}
	}

	async submitChallenge(state: string, signature: string): Promise<any> {
		const submitBody = `client_id=${this.credentials.clientId}&domain=${encodeURIComponent(this.credentials.redirectUri)}&state=${state}&signature=${signature}&grant_type=authorization_code`;

		console.log('[DIMO] Submitting challenge:', {
			state,
			signature,
			signatureLength: signature.length,
			url: `${this.basePath}/auth/web3/submit_challenge`,
		});

		try {
			const submitResponse = await this.executeFunctions.helpers.request({
				method: 'POST',
				url: `${this.basePath}/auth/web3/submit_challenge`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': 'dimo-n8n',
				},
				body: submitBody,
			});

			console.log('[DIMO] Submit challenge response received');
			const parsed = typeof submitResponse === 'string' ? JSON.parse(submitResponse) : submitResponse;
			console.log('[DIMO] Response parsed successfully:', {
				hasAccessToken: !!parsed?.access_token,
			});

			return parsed;
		} catch (error: any) {
			console.error('[DIMO] Submit challenge error:', {
				status: error.response?.status || error.statusCode,
				statusText: error.response?.statusText || error.message,
				data: error.response?.data || error.response?.body,
				message: error.message,
			});
			throw error;
		}
	}

	async getDeveloperJwt(): Promise<string> {
		this.checkRedirectUri();
		const { challenge, state } = await this.generateChallenge();
		const signature = await this.signChallenge(challenge);
		const response = await this.submitChallenge(state, signature);

		return response.access_token;
	}

	private decodePermissionBits(permissionsHex: string): number[] {
		const cleanHex = permissionsHex.toLowerCase().replace('0x','');
		const permissionBits = BigInt(`0x${cleanHex}`);
		const grantedPermissions: number[] = [];

		for (let i = 0; i < 128; i++) {
			const bitPair = (permissionBits >> BigInt(i * 2)) & BigInt(0b11);
			if (bitPair === BigInt(0b011)) {
				grantedPermissions.push(i);
			}
		}
		return grantedPermissions;
	}

	async permissionsDecoder(tokenId: number): Promise<any> {

		const developerLicense = this.credentials.clientId;

		const IDENTITY_QUERY = `{
				vehicle(tokenId: ${tokenId}) {
					sacds(first:100) {
						nodes {
							permissions
							grantee
						}
					}
				}
			}`;
		try {
			const queryResponse = await this.executeFunctions.helpers.request({
				method: 'POST',
				url: 'https://identity-api.dimo.zone/query',
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': 'dimo-n8n',
				},
				body: JSON.stringify({
					query: IDENTITY_QUERY,
					variables: {},
				}),
			});

			const parsedQueryResponse =
				typeof queryResponse === 'string' ? JSON.parse(queryResponse) : queryResponse;

			const nodes = parsedQueryResponse?.data?.vehicle?.sacds?.nodes;
			if (!nodes || !Array.isArray(nodes)) {
				throw new Error('Invalid response format: missing nodes array');
			}

			const filteredSacd = nodes.find(
				(node: any) => node?.grantee?.toLowerCase() === developerLicense.toLowerCase(),
			);

			if (!filteredSacd) {
				throw new Error(
					`No permissions found for developer license: ${developerLicense}. Has this vehicle been shared?`,
				);
			}

			const decodedPermissions = this.decodePermissionBits(filteredSacd.permissions);

			return decodedPermissions.join(',');

		} catch (error: any) {
			throw new Error(`Failed to decode permissions: ${error.message}`);
		}
	}

	async getVehicleJwt(devJwt: string, tokenId: number, privilegesString: string): Promise<string> {
		const privileges = privilegesString.split(',').map((p) => parseInt(p.trim(), 10));
		const vehicleJwtResponse = await this.executeFunctions.helpers.request({
			method: 'POST',
			url: 'https://token-exchange-api.dimo.zone/v1/tokens/exchange',
			headers: {
				Authorization: `Bearer ${devJwt}`,
				'Content-Type': 'application/json',
				'User-Agent': 'dimo-n8n',
			},
			body: JSON.stringify({
				nftContractAddress: this.nftAddress,
				privileges,
				tokenId,
			}),
		});

		const parsedVehicleJwtResponse =
			typeof vehicleJwtResponse === 'string' ? JSON.parse(vehicleJwtResponse) : vehicleJwtResponse;

		return parsedVehicleJwtResponse.token;
	}
}
