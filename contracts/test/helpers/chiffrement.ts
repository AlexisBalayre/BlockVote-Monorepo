import { ethers } from 'ethers';
import Cryptr from "cryptr";
import { Buffer } from 'buffer';

// Initialiser une clé secrète aléatoire pour le chiffrement et la déchiffrement
const secretKey = generateSecret() 
const cryptr = new Cryptr(secretKey);

// Fonction pour chiffrer le vote en utilisant la clé secrète
export function encryptVote(voteIndex: number): string {
    const plainText = voteIndex.toString();
    const encryptedVote = cryptr.encrypt(plainText);
    const encryptedVoteHex = '0x' + Buffer.from(encryptedVote, 'utf8').toString('hex');
    return encryptedVoteHex;
}

// Fonction pour déchiffrer le vote chiffré en utilisant la clé secrète
export function decryptVote(encryptedVote: string): number {
    const encryptedVoteString = Buffer.from(encryptedVote.slice(2), 'hex').toString('utf8');
    const decryptedVote = cryptr.decrypt(encryptedVoteString);
    return parseInt(decryptedVote);
}

// Fonction pour calculer le hash d'un vote chiffré
export function calculateVoteHash(encryptedVote: string): string {
    const voteHash = ethers.utils.keccak256(encryptedVote);
    return voteHash;
}

// Fonction pour convertir une chaîne de caractères en bytes32
export function stringToBytes32(input: string): string {
    const inputBytes = ethers.utils.toUtf8Bytes(input);
    const inputHex = ethers.utils.hexlify(inputBytes);
    const paddedInputHex = inputHex.padEnd(66, '0');
    return paddedInputHex;
}

// Fonction pour générer une clé secrète aléatoire
function generateSecret(): string {
  return ethers.utils.randomBytes(32).toString();
}
