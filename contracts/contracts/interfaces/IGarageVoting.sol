// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../semaphore/interfaces/ISemaphoreVerifier.sol";

/**
 * @title GarageVoting Contract Interface
 * @notice The interface of the contract for creating and managing polls on the Ethereum blockchain
 * Each vote is encrypted using a zero-knowledge proof to ensure privacy and prevent double-voting.
 */
interface IGarageVoting {
    // Caller is not the poll coordinator
    error CallerIsNotThePollCoordinator();
    // Merkle tree depth is not supported
    error MerkleTreeDepthIsNotSupported();
    // Poll has already been started
    error PollHasAlreadyBeenStarted();
    // Poll is not ongoing
    error PollIsNotOngoing();
    // You are using the same nillifier twice
    error YouAreUsingTheSameNillifierTwice();
    // Access is restricted
    error AccessRestricted(address caller);
    // Poll does not exist
    error PollDoesNotExist(uint256 pollId);
    // Invalid options
    error InvalidOptions();
    // Invalid timestamps
    error InvalidTimestamps();

    // The state of the poll
    enum PollState {
        Created,
        Ongoing,
        Ended
    }

    // The data of a verifier
    struct Verifier {
        address contractAddress;
        uint256 merkleTreeDepth;
    }

    /**
     * @notice Emitted when a new poll is created.
     * @param pollId Id of the poll.
     * @param coordinator Coordinator of the poll.
     */
    event PollCreated(uint256 indexed pollId, address indexed coordinator);

    /**
     * @notice Emitted when a new voter is added to a poll.
     * @param pollId Id of the poll.
     * @param commitment  Address of the voter.
     */
    event VoterAdded(uint256 indexed pollId, uint256 indexed commitment);

    /**
     * @notice Emitted when the Merkle tree depth is changed.
     * @param newMerkleTreeDepth New depth of the Merkle tree.
     */
    event MerkleTreeDepthChanged(uint256 newMerkleTreeDepth);

    /**
     * @notice Emitted when the Verifier contract is changed.
     * @param newVerifier New address of the Verifier contract.
     */
    event VerifierContractChanged(address newVerifier);

    /**
     * @notice Emitted when the Poll contract implementation is changed.
     * @param newPollContractImplementation New address of the Poll contract implementation.
     */
    event PollContractImplementationChanged(address newPollContractImplementation);

    /**
     * @notice Creates a poll and the associated Merkle tree/group.
     * @param _options Options for the poll.
     * @param _name Name of the poll.
     * @param _startTimestamp Start timestamp of the poll.
     * @param _endTimestamp End timestamp of the poll.
     */
    function createPoll(
        string[] calldata _options,
        string calldata _name,
        uint256 _startTimestamp,
        uint256 _endTimestamp
    ) external;

    /**
     * @notice Returns the address of the verifier contract
     * @return _verifier Address of the verifier contract.
     */
    function verifier() external view returns (ISemaphoreVerifier _verifier);

    /**
     * @notice Returns the Merkle Tree Data of a poll.
     * @param _pollID Id of the poll.
     * @return _merkleTreeDepth Depth of the Merkle tree.
     * @return _merkleTreeRoot Root of the Merkle tree.
     */
    function getMerkleTreeData(
        uint256 _pollID
    ) external view returns (uint256 _merkleTreeDepth, uint256 _merkleTreeRoot);

    /**
     * @notice Returns the address of the poll contract
     * @param _pollID Id of the poll.
     * @return _pollContract Address of the poll contract.
     */
    function getPollContract(uint256 _pollID) external view returns (address);

    /**
     * @notice Returns the amount of polls.
     * @return _pollsAmount Amount of polls.
     */
    function getPollsAmount() external view returns (uint256);

    /**
     * @notice Sets the Poll contract implementation.
     * @param _newPollContractImplementation New address for the Poll contract implementation.
     */
    function setPollContractImplementation(
        address _newPollContractImplementation
    ) external;

    /**
     * @notice Sets the Semaphore verifier.
     * @param _verifier New address for the Semaphore verifier.
     */
    function setVerifier(ISemaphoreVerifier _verifier) external;

    /**
     * @notice Sets the depth of the Merkle tree.
     * @param _merkleTreeDepth New depth for the Merkle tree.
     */
    function setMerkleTreeDepth(uint256 _merkleTreeDepth) external;

    /**
     * @notice Adds a voter to a poll.
     * @param _pollId Id of the poll.
     * @param _identityCommitment Identity commitment of the voter.
     */
    function addVoter(
        uint256 _pollId,
        uint256 _identityCommitment
    ) external; 
}
