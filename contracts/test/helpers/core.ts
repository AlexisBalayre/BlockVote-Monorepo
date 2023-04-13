import { ethers } from "hardhat";
import { Logger, ILogObj } from "tslog";
import { SemaphoreVerifier, SemaphoreVerifier__factory, GarageVoting, GarageVoting__factory, Poll, Pairing, Pairing__factory, PoseidonT3 } from "../../typechain-types";
import { poseidon_gencontract as poseidonContract } from "circomlibjs";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config"
import { expect } from "chai";
import { Group } from "@semaphore-protocol/group";

export const Log: Logger<ILogObj> = new Logger();

export async function deployContracts(
    signer: SignerWithAddress,
): Promise<GarageVoting> {
    // Deploy Pairing library contract
    Log.info("Deploying Pairing library contract...");
    const PairingFactory: Pairing__factory = await ethers.getContractFactory("Pairing");
    const pairing: Pairing = await PairingFactory.connect(signer).deploy();
    await pairing.deployed();
    Log.info(`Pairing library contract has been deployed to: ${pairing.address}`);

    // Deploy Semaphore Verifier contract
    Log.info("Deploying Semaphore Verifier contract...");
    const VerifierFactory: SemaphoreVerifier__factory = await ethers.getContractFactory("SemaphoreVerifier", {
        libraries: {
            Pairing: pairing.address,
        },
    });
    const verifier: SemaphoreVerifier = await VerifierFactory.connect(signer).deploy();
    await verifier.deployed();
    Log.info(`Semaphore Verifier contract has been deployed to: ${verifier.address}`);

    // Deploy Poseidon library contract
    Log.info("Deploying Poseidon library contract...");
    const poseidonABI = poseidonContract.generateABI(2)
    const poseidonBytecode = poseidonContract.createCode(2)
    const PoseidonFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
    const poseidon = await PoseidonFactory.deploy()
    await poseidon.deployed()
    Log.info(`Poseidon library contract has been deployed to: ${poseidon.address}`);

    // Deploy IncrementalBinaryTree library contract
    Log.info("Deploying IncrementalBinaryTree library contract...");
    const IncrementalBinaryTreeFactory = await ethers.getContractFactory("contracts/zk-kit/IncrementalBinaryTree.sol:IncrementalBinaryTree", {
        libraries: {
            PoseidonT3: poseidon.address,
        },
    });
    const incrementalBinaryTree = await IncrementalBinaryTreeFactory.connect(signer).deploy();
    await incrementalBinaryTree.deployed();
    Log.info(`IncrementalBinaryTree library contract has been deployed to: ${incrementalBinaryTree.address}`);

   // Deploy GarageVoting contract
   Log.info("Deploying GarageVoting contract...");
   const GarageVotingFactory = await ethers.getContractFactory("GarageVoting", {
       libraries: {
        IncrementalBinaryTree: incrementalBinaryTree.address,
       },
   });
   const garageVoting: GarageVoting = await GarageVotingFactory.connect(signer).deploy(verifier.address);
   await garageVoting.deployed();
   Log.info(`GarageVoting contract has been deployed to: ${garageVoting.address}`);
    return garageVoting;
}

export async function createPoll(
    signer: SignerWithAddress,
    garageVoting: GarageVoting,
    pollName: string,
    pollOptions: string[],
    pollStartTimestamp: BigNumber,
    pollEndTimestamp: BigNumber,
): Promise<Poll> {
    Log.info("Creating poll...");
    await garageVoting.connect(signer).createPoll(
        pollOptions, 
        pollName,
        pollStartTimestamp,
        pollEndTimestamp
    )
    const pollId: BigNumber = await garageVoting.getPollsAmount();
    const pollAddress: string = await garageVoting.getPollContract(pollId.sub(1));
    const poll: Poll = await ethers.getContractAt("Poll", pollAddress);
    Log.info(`Poll has been created with id: ${pollId.sub(1)}`);
    Log.info(`Poll has been created with address: ${pollAddress}`);
    return poll;
}

export const addVoter = async (
    signer: SignerWithAddress,
    garageVoting: GarageVoting,
    pollId: BigNumber,
    pollGroup: Group,
    commitment: BigNumber
) :Promise<void> =>  {
    Log.info("Adding voter with commitment: " + commitment + " to poll with id: " + pollId + "...");
    expect(await garageVoting.connect(signer).addVoter(pollId, commitment)).to.emit(garageVoting, "MemberAdded")
    .withArgs(pollId, BigNumber.from(0), commitment, pollGroup.root);
    Log.info(`Voter has been added to poll with id: ${pollId}`);
}
    