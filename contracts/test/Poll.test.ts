// Import required modules and functions
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import download from "download";
import { existsSync } from "fs";

// Import custom helper functions and types
import { GarageVoting, Poll } from "../typechain-types";
import * as hpCore from "./helpers/core";
import * as hpChiffrement from "./helpers/chiffrement";
import * as hpSemaphore from "./helpers/semaphore";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";

// Describe the test suite
describe("Poll contract testing", () => {
  // Declare variables used in the test suite
  let garageVoting: GarageVoting;
  let poll: Poll;
  let pollGroup: Group;
  let owner: SignerWithAddress;
  let admins: SignerWithAddress[];
  let users: SignerWithAddress[];
  let encryptedVotes: string[];
  let identities: Identity[];
  let pollOptions: string[];
  let pollName: string;
  let pollStartTimestamp: BigNumber;
  let pollEndTimestamp: BigNumber;

  // Constants for snark artifacts
  const snarkArtifactsURL = "https://www.trusted-setup-pse.org/semaphore/20";
  const snarkArtifactsPath = "./artifacts/snark";

  // Set the number of voters for the test
  const amountVoters = 5;

  // Before hook to set up the test environment
  before(async () => {
    // Download snark artifacts if they don't exist
    if (!existsSync(`${snarkArtifactsPath}/semaphore.wasm`)) {
      await download(
        `${snarkArtifactsURL}/semaphore.wasm`,
        `${snarkArtifactsPath}`
      );
      await download(
        `${snarkArtifactsURL}/semaphore.zkey`,
        `${snarkArtifactsPath}`
      );
    }

    // Get the signer objects
    owner = (await ethers.getSigners())[0];
    admins = (await ethers.getSigners()).slice(1, 3);
    users = (await ethers.getSigners()).slice(3, 5);

    // Deploy the contracts
    garageVoting = await hpCore.deployContracts(owner);

    // Grant the admin role to the admins
    for (let i = 0; i < admins.length; i++) {
      await garageVoting.grantRole(
        await garageVoting.ADMIN_ROLE(),
        admins[i].address
      );
    }

    // Generate identities for the voters
    identities = [];
    for (let i = 0; i < amountVoters; i++) {
      identities.push(hpSemaphore.generateNewIdentify());
    }

    // Create a new group for the poll
    pollGroup = hpSemaphore.generateNewGroup(1);

    // Define poll options, name, start and end timestamps
    pollOptions = ["Option 1", "Option 2", "Option 3"];
    pollName = "Test Poll";
    pollStartTimestamp = BigNumber.from(Math.floor(Date.now() / 1000));
    pollEndTimestamp = BigNumber.from(Math.floor(Date.now() / 1000) + 86400);

    // Initialize the encrypted votes array
    encryptedVotes = [];
  });

  // Test case: Admin should be able to create a poll
  it("Should allow an admin to create a poll", async () => {
    poll = await hpCore.createPoll(
      admins[0],
      garageVoting,
      pollName,
      pollOptions,
      pollStartTimestamp,
      pollEndTimestamp
    );
  });

  // Test case: Admin should be able to add voters to a poll
  it("Should allow an admin to add voters to a poll", async () => {
    const pollId = await poll.pollID();
    hpCore.Log.info(`Poll ID: ${pollId}`);
    for (let i = 0; i < amountVoters; i++) {
      pollGroup.addMember(identities[i].commitment);
      await hpCore.addVoter(
        admins[0],
        garageVoting,
        pollId,
        pollGroup,
        BigNumber.from(identities[i].commitment)
      );
    }
  });

  // Test case: Users should be able to vote
  it("Should allow users to vote", async () => {
    const pollId = await poll.pollID();
    for (let i = 0; i < identities.length; i++) {
      const voteIndex = i % pollOptions.length;
      hpCore.Log.info(`Voter ${i} is voting for option ${voteIndex}`);

      hpCore.Log.info(`Encrypting vote`);
      const encryptedVote = hpChiffrement.encryptVote(voteIndex);
      encryptedVotes.push(encryptedVote);
      hpCore.Log.info(`Encrypted vote: ${encryptedVote}`);

      hpCore.Log.info(`Computing the hash of the encrypted vote`);
      const encryptedVoteHash = hpChiffrement.calculateVoteHash(encryptedVote);
      hpCore.Log.info(`Encrypted vote hash: ${encryptedVoteHash}`);

      hpCore.Log.info(`Generating proof`);
      const fullProof = await hpSemaphore.generateProofForGroup(
        pollGroup,
        pollId.toBigInt(),
        BigNumber.from(encryptedVoteHash).toBigInt(),
        identities[i]
      );

      const bool = await hpSemaphore.verifyProofForGroup(fullProof);
      hpCore.Log.info(`Proof is valid: ${bool}`);

      hpCore.Log.info(`Sending vote`);
      await poll.castVote(
        encryptedVoteHash,
        fullProof.nullifierHash,
        fullProof.proof
      );
      hpCore.Log.info(`Vote sent`);
    }

    // Verify if the encrypted vote hashes are correct
    const voteEncryptedHashs = await poll.getEncryptedVotes();
    for (let i = 0; i < voteEncryptedHashs.length; i++) {
      hpCore.Log.info(`Encrypted vote hash ${i}: ${voteEncryptedHashs[i]}`);
      const hash = hpChiffrement.calculateVoteHash(encryptedVotes[i]);
      expect(voteEncryptedHashs[i]).to.equal(hash);
      hpCore.Log.info(`Encrypted vote hash ${i} is correct`);
    }
  });

  // Test case: Non-admin should not be able to create a poll
  it("Should not allow a non-admin to create a poll", async () => {
    await expect(
      hpCore.createPoll(
        users[0],
        garageVoting,
        "Invalid Poll",
        ["Option 1", "Option 2"],
        pollStartTimestamp,
        pollEndTimestamp
      )
    ).to.be.reverted;
  });

  // Test case: Non-admin should not be able to add voters to a poll
  it("Should not allow a non-admin to add voters to a poll", async () => {
    const pollId = await poll.pollID();
    await expect(
      hpCore.addVoter(
        users[0],
        garageVoting,
        pollId,
        pollGroup,
        BigNumber.from(identities[0].commitment)
      )
    ).to.be.reverted;
  });

  // Test case: User should not be able to vote more than once
  it("Should not allow a user to vote more than once", async () => {
    const pollId = await poll.pollID();
    const voteIndex = 0;
    const encryptedVote = hpChiffrement.encryptVote(voteIndex);
    const encryptedVoteHash = hpChiffrement.calculateVoteHash(encryptedVote);
    const fullProof = await hpSemaphore.generateProofForGroup(
      pollGroup,
      pollId.toBigInt(),
      BigNumber.from(encryptedVoteHash).toBigInt(),
      identities[0]
    );
    await expect(
      poll.castVote(encryptedVoteHash, fullProof.nullifierHash, fullProof.proof)
    ).to.be.reverted;
  });

  // Test case: User should not be able to vote before the poll starts
  it("Should not allow a user to vote before the poll starts", async () => {
    const pollId = await poll.pollID();
    const voteIndex = 0;
    const encryptedVote = hpChiffrement.encryptVote(voteIndex);
    const encryptedVoteHash = hpChiffrement.calculateVoteHash(encryptedVote);
    const fullProof = await hpSemaphore.generateProofForGroup(
      pollGroup,
      pollId.toBigInt(),
      BigNumber.from(encryptedVoteHash).toBigInt(),
      identities[0]
    );
    await expect(
      poll.castVote(encryptedVoteHash, fullProof.nullifierHash, fullProof.proof)
    ).to.be.reverted;
  });

  // Test case: User should not be able to vote after the poll ends
  it("Should not allow a user to vote after the poll ends", async () => {
    const pollId = await poll.pollID();
    const voteIndex = 0;
    const encryptedVote = hpChiffrement.encryptVote(voteIndex);
    const encryptedVoteHash = hpChiffrement.calculateVoteHash(encryptedVote);
    const fullProof = await hpSemaphore.generateProofForGroup(
      pollGroup,
      pollId.toBigInt(),
      BigNumber.from(encryptedVoteHash).toBigInt(),
      identities[0]
    );
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine", []);
    await expect(
      poll.castVote(encryptedVoteHash, fullProof.nullifierHash, fullProof.proof)
    ).to.be.reverted;
  });

  // Test case: User should not be able to vote with an option that's not in the poll
  it("Should not allow a user to vote with an option that's not in the poll", async () => {
    const pollId = await poll.pollID();
    const voteIndex = pollOptions.length; // This index is not in the poll options
    const encryptedVote = hpChiffrement.encryptVote(voteIndex);
    const encryptedVoteHash = hpChiffrement.calculateVoteHash(encryptedVote);
    const fullProof = await hpSemaphore.generateProofForGroup(
      pollGroup,
      pollId.toBigInt(),
      BigNumber.from(encryptedVoteHash).toBigInt(),
      identities[0]
    );
    await expect(
      poll.castVote(encryptedVoteHash, fullProof.nullifierHash, fullProof.proof)
    ).to.be.reverted;
  });
});
