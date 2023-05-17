import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { FullProof, generateProof, verifyProof } from "@semaphore-protocol/proof"
import { Injectable } from "@nestjs/common";


@Injectable()
export class SemaphoreService {
    // Function to generate a new Semaphore identity
    generateNewIdentify(): Identity {
        return new Identity();
    }

    // Function to generate a new Semaphore group
    generateNewGroup(groupId: number): Group {
        return new Group(groupId, 20);
    };

    addMemberToGroup(group: Group, commitment: bigint): Group {
        group.addMember(commitment);
        return group;
    }

    // Function to add multiple members to a Semaphore group
    addMembersToGroup(group: Group, commitments: bigint[]): Group {
        commitments.forEach((commitment) => {
            group.addMember(commitment);
        });
        return group;
    }

    // Function to generate a proof for a vote 
    async generateProofForGroup(poll: Group, pollId: bigint, vote: bigint, identity: Identity): Promise<FullProof> {
        const fullProof = await generateProof(identity, poll, pollId, vote, {
            zkeyFilePath: "./artifacts/snark/semaphore.zkey",
            wasmFilePath: "./artifacts/snark/semaphore.wasm"
        });
        return fullProof;
    }

    // Function to verify a proof for a vote
    async verifyProofForGroup(proof: FullProof): Promise<boolean> {
        const result = await verifyProof(proof, 20);
        return result;
    }
}