// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/**
 * @title Poll Contract Interface
 * @notice This contract interface represents a poll where users can vote.
 * Each vote is encrypted using a zero-knowledge proof to ensure privacy and prevent double-voting.
 */
interface IPoll {
    // You are using the same nillifier twice
    error YouAreUsingTheSameNillifierTwice();
    // Poll has not started yet
    error PollHasNotStartedYet();
    // Poll has already ended
    error PollHasEnded();

    // The state of the poll
    enum PollState {
        Created,
        Ongoing,
        Ended
    }

    // The data of a poll
    struct PollData {
        string[] options;
        string name;
        uint256 totalVotesAmount;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }
    
    // The data of an option
    struct OptionData {
        string option;
        uint256 voteIndex;
    }

    /**
     * @notice Returns the encrypted votes.
     * @return encryptedVotes encypted votes.
     */
    function getEncryptedVotes() external view returns (bytes32[] memory encryptedVotes);

    /**
     * @notice Returns the poll data.
     * @return pollData The Poll data.
     */
    function getPollData() external view returns (PollData memory pollData);

    /**
     * @notice Returns the options.
     * @return _options The Options.
     */
    function getOptions() external view returns (OptionData[] memory _options);

    /**
     * @notice Returns the poll state.
     * @return state The Poll state.
     */ 
    function getPollState() external view returns (PollState state);

    /**
     * @notice Casts a vote.
     * @param _vote The Vote.
     * @param _nullifierHash The Nullifier hash.
     * @param _proof The Proof.
     */
    function castVote(
        bytes32 _vote,
        uint256 _nullifierHash,
        uint256[8] calldata _proof
    ) external;
}