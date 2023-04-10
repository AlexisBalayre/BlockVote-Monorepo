import { ethers } from 'ethers';
import Cryptr from "cryptr";
import { Buffer } from 'buffer';

const secretKey = generateSecret() // Utilisez une clé secrète forte et unique pour votre application
const cryptr = new Cryptr(secretKey);

// Fonction pour chiffrer le vote
function encryptVote(voteIndex: number): ethers.BigNumber {
    const plainText = voteIndex.toString();
    const encryptedVote = cryptr.encrypt(plainText);
    // Converti le vote en BigNumber
    const encryptedVoteBn = stringToBigNumber(encryptedVote);
    return encryptedVoteBn;
}

// Fonction pour déchiffrer le vote
function decryptVote(encryptedVote: ethers.BigNumber): number {
    // Convertir le vote hexadécimal en texte
    const encryptedVoteString = bigNumberToString(encryptedVote);
    const decryptedVote = cryptr.decrypt(encryptedVoteString);
    return parseInt(decryptedVote);
}

function stringToBigNumber(s: string): ethers.BigNumber {
    const buf = Buffer.from(s, 'utf8');
    const hexString = '0x' + buf.toString('hex');
    return ethers.BigNumber.from(hexString);
}

function bigNumberToString(bn: ethers.BigNumber): string {
    const hexString = bn.toHexString().slice(2);
    const buf = Buffer.from(hexString, 'hex');
    return buf.toString('utf8');
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
