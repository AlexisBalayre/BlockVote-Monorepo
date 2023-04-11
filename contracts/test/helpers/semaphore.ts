import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { FullProof, generateProof, verifyProof } from "@semaphore-protocol/proof"
import { BytesLike, Hexable } from "ethers/lib/utils";
import { BigNumber } from "ethers";

// Function to generate a new Semaphore identity
export function generateNewIdentify(): Identity {
	const identity = new Identity();
    return identity;
};

// Function to generate a new Semaphore group
export function generateNewGroup(groupId: number): Group {
    const group = new Group(groupId, 20);
    return group;
};

// Function to add a member to a Semaphore group
export function addMemberToGroup(group: Group, commitment: bigint): Group {
    group.addMember(commitment);
    return group;
}

// Function to add multiple members to a Semaphore group
export function addMembersToGroup(group: Group, commitments: bigint[]): Group {
    commitments.forEach((commitment) => {
        group.addMember(commitment);
    });
    return group;
}

// Function to generate a proof for a vote 
export async function generateProofForGroup(poll: Group, pollId: bigint, vote: bigint, identity: Identity): Promise<FullProof> {
    const fullProof = await generateProof(identity, poll, pollId, vote, {
        zkeyFilePath: "./artifacts/snark/semaphore.zkey",
        wasmFilePath: "./artifacts/snark/semaphore.wasm"
    });
    return fullProof;
}

// Function to verify a proof for a vote
export async function verifyProofForGroup(proof: FullProof): Promise<boolean> {
    const result = await verifyProof(proof, 20);
    return result;
}

