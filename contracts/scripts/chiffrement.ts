import { ethers } from 'ethers';
import Cryptr from "cryptr";
import { Buffer } from 'buffer';

const secretKey = generateSecret() // Utilisez une clé secrète forte et unique pour votre application
const cryptr = new Cryptr(secretKey);

// Fonction pour chiffrer le vote
export function encryptVote(voteIndex: number): string {
    const plainText = voteIndex.toString();
    const encryptedVote = cryptr.encrypt(plainText);
    // Convertir le vote en chaîne hexadécimale
    const encryptedVoteHex = '0x' + Buffer.from(encryptedVote, 'utf8').toString('hex');
    return encryptedVoteHex;
}

// Fonction pour déchiffrer le vote
export function decryptVote(encryptedVote: string): number {
    // Convertir le vote en chaîne de caractères
    const encryptedVoteString = Buffer.from(encryptedVote.slice(2), 'hex').toString('utf8');
    const decryptedVote = cryptr.decrypt(encryptedVoteString);
    return parseInt(decryptedVote);
}

// Fonction pour calculer le hash d'un vote chiffré
function calculateVoteHash(encryptedVote: string): string {
    const voteHash = ethers.utils.keccak256(encryptedVote);
    return voteHash;
}

// Fonction pour générer un secret aléatoire
function generateSecret(): string {
  return ethers.utils.randomBytes(32).toString();
}


const vote1_encrypted = encryptVote(1);
const vote2_encrypted = encryptVote(1);
const vote3_encrypted = encryptVote(2);
const vote4_encrypted = encryptVote(2);
console.log("Vote 1 encrypted", vote1_encrypted);
console.log("Vote 2 encrypted", vote2_encrypted);
console.log("Vote 3 encrypted", vote3_encrypted);
console.log("Vote 4 encrypted", vote4_encrypted);

const vote1_decrypted = decryptVote(vote1_encrypted);
const vote2_decrypted = decryptVote(vote2_encrypted);
const vote3_decrypted = decryptVote(vote3_encrypted);
const vote4_decrypted = decryptVote(vote4_encrypted);
console.log("Vote 1 decrypted", vote1_decrypted);
console.log("Vote 2 decrypted", vote2_decrypted);
console.log("Vote 3 decrypted", vote3_decrypted);
console.log("Vote 4 decrypted", vote4_decrypted);

const vote1_hash = calculateVoteHash(vote1_encrypted);
const vote2_hash = calculateVoteHash(vote2_encrypted);
const vote3_hash = calculateVoteHash(vote3_encrypted);
const vote4_hash = calculateVoteHash(vote4_encrypted);
console.log("Vote 1 hash", vote1_hash);
console.log("Vote 2 hash", vote2_hash);
console.log("Vote 3 hash", vote3_hash);
console.log("Vote 4 hash", vote4_hash);
