// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../Semaphore/interfaces/ISemaphoreVerifier.sol";

interface IGarageVoting {
        error CallerIsNotThePollCoordinator();
        error MerkleTreeDepthIsNotSupported();
        error PollHasAlreadyBeenStarted();
        error PollIsNotOngoing();
        error YouAreUsingTheSameNillifierTwice();
        error AccessRestricted(address caller);
        error PollDoesNotExist(uint256 pollId);
        error InvalidOptions();
        error InvalidTimestamps();

        enum PollState {
            Created,
            Ongoing,
            Ended
        }

        struct Verifier {
            address contractAddress;
            uint256 merkleTreeDepth;
        }

        /// @dev Emitted when a new poll is created.
        /// @param pollId: Id of the poll.
        /// @param coordinator: Coordinator of the poll.
        event PollCreated(uint256 pollId, address indexed coordinator);

        /// @dev Creates a poll and the associated Merkle tree/group.
        /// @param _options: Options of the poll.
        /// @param _startTimestamp: Start timestamp of the poll.
        /// @param _endTimestamp: End timestamp of the poll.
        function createPoll(
            string[] calldata _options,
            uint256 _startTimestamp,
            uint256 _endTimestamp
        ) external;

        /// @dev Returns the address of the verifier contract
        function verifier() external view returns (ISemaphoreVerifier _verifier);

        function getMerkleTreeData(uint256 _pollID) external view returns (uint256 _merkleTreeDepth, uint256 _merkleTreeRoot);

}