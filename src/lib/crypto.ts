/**
 * @fileOverview Institutional Cryptographic Protocol Engine
 * 
 * This engine handles the core trust requirements of the Eco Ledger:
 * 1. INTEGRITY: SHA-256 hashing for tamper-evident data fingerprints.
 * 2. AUTHENTICITY: RSA-4096 digital signatures for non-repudiation of settlements.
 * 3. PRIVACY: AES-256-GCM encryption for securing sensitive financial values.
 * 4. CONSENSUS: Merkle Tree logic for anchoring the global network state.
 */

/**
 * Computes a SHA-256 fingerprint for a given data object.
 * ROLE: Ensures that any modification to a record is detectable.
 */
export async function computeHash(data: any): Promise<string> {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a random salt for password security.
 */
export function generateSalt(length: number = 16): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map(v => charset[v % charset.length]).join('');
}

/**
 * Hashes a password using SHA-256 with a unique salt.
 * ROLE: Protects node access keys from brute-force discovery.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  return computeHash(password + salt);
}

/**
 * Calculates a Merkle Root from an array of hashes.
 * ROLE: Anchors multiple events into a single "State Root" for global consensus.
 */
export async function calculateMerkleRoot(hashes: string[]): Promise<string> {
  if (!hashes || hashes.length === 0) return "f29567c30985223e7f9188448b1110e53a5a73e5a59f5";
  let level = [...hashes];
  while (level.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || left; 
      const combinedHash = await computeHash(left + right);
      nextLevel.push(combinedHash);
    }
    level = nextLevel;
  }
  return level[0];
}

export type NodeKeyPair = {
  publicKey: string;
  privateKey: string;
};

/**
 * Generates an institutional-grade RSA-4096 key pair.
 * ROLE: Establishes the non-custodial identity of a network node.
 */
export async function generateNodeKeyPair(): Promise<NodeKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 4096, 
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  const pubExported = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const pubBase64 = btoa(String.fromCharCode(...new Uint8Array(pubExported)));
  
  const privExported = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const privBase64 = btoa(String.fromCharCode(...new Uint8Array(privExported)));

  return {
    publicKey: `-----BEGIN PUBLIC KEY-----\n${pubBase64}\n-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----\n${privBase64}\n-----END PRIVATE KEY-----`
  };
}

/**
 * Encrypts data using AES-256-GCM.
 * ROLE: Secures financial values (like prices) on the public ledger.
 */
export async function encryptData(data: string | number, secret: string = "eco-ledger-institutional-vault-key"): Promise<string> {
  const text = data.toString();
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(text);
  const secretKeyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
  const key = await crypto.subtle.importKey("raw", secretKeyBuffer, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedData);
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts AES-256-GCM ciphertexts.
 * ROLE: Allows authorized nodes to resolve financial values for analytics.
 */
export async function decryptData(encryptedBase64: string, secret: string = "eco-ledger-institutional-vault-key"): Promise<string> {
  if (!encryptedBase64 || typeof encryptedBase64 !== 'string' || encryptedBase64.length < 20) return encryptedBase64 || "N/A";
  try {
    const binary = atob(encryptedBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    const encoder = new TextEncoder();
    const secretKeyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
    const key = await crypto.subtle.importKey("raw", secretKeyBuffer, "AES-GCM", false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return encryptedBase64;
  }
}

/**
 * Signs data using an RSA private key.
 * ROLE: Creates non-repudiable proof of approval or settlement.
 */
export async function signData(data: string, privateKeyPem: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const b64 = privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const privateKey = await crypto.subtle.importKey("pkcs8", binaryDer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, dataBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Verifies an RSA signature against a public key.
 * ROLE: Mathematically proves the authenticity of any record in the ledger.
 */
export async function verifySignature(data: string, signatureB64: string, publicKeyPem: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const signatureBuffer = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    const b64 = publicKeyPem.replace(/-----BEGIN PUBLIC KEY-----/, "").replace(/-----END PUBLIC KEY-----/, "").replace(/\s/g, "");
    const binaryDer = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const publicKey = await crypto.subtle.importKey("spki", binaryDer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, signatureBuffer, dataBuffer);
  } catch (e) {
    return false;
  }
}