// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./semaphore/interfaces/ISemaphoreVerifier.sol";

import "./interfaces/IGarageVoting.sol";
import "./interfaces/IPoll.sol";

/**
 * @title Poll Contract
 * @notice This contract represents a poll where users can vote.
 * Each vote is encrypted using a zero-knowledge proof to ensure privacy and prevent double-voting.
 */
contract Poll is Initializable, IPoll, ReentrancyGuard {
    // The ID of the poll
    uint256 public pollID;
    // The GarageVoting contract instance
    IGarageVoting public garageVoting;
    
    // The options of the poll
    bytes32[] private options; 
    // The name of the poll
    string public name;
    // The total amount of votes cast in the poll
    uint256 public totalVotesAmount;
    // The start timestamp of the poll
    uint256 public startTimestamp;
    // The end timestamp of the poll
    uint256 public endTimestamp;

    // Mapping of vote indices to their encrypted votes
    mapping(uint256 => bytes32) public votes;
    // Mapping of nullifier hashes to their usage status
    mapping(uint256 => bool) public nullifierHashes;

    /**
     * @notice Initializes the poll.
     * @param _options Options of the poll.
     * @param _name Name of the poll.
     * @param _pollID Id of the poll.
     * @param _startTimestamp Start timestamp of the poll.
     * @param _endTimestamp End timestamp of the poll.
     */
    function initialize(
        string[] calldata _options,
        string calldata _name,
        uint256 _pollID,
        uint256 _startTimestamp,
        uint256 _endTimestamp
	) public initializer {
        garageVoting = IGarageVoting(msg.sender);

        for (uint256 i = 0; i < _options.length; ++i) {
            options.push(stringToBytes32(_options[i]));
        }

        pollID = _pollID;
        name = _name;

        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;
	}
    
    /**
     * @notice Returns the encrypted votes.
     * @return encryptedVotes The encypted votes.
     */
    function getEncryptedVotes() external view returns (bytes32[] memory encryptedVotes) {
        encryptedVotes = new bytes32[](totalVotesAmount);
        for (uint256 i = 0; i < totalVotesAmount; ++i) {
            encryptedVotes[i] = votes[i];
        }
    }

    /**
     * @notice Returns the poll data.
     * @return pollData The Poll data.
     */
    function getPollData() external view returns (PollData memory pollData) {
        bytes32[] memory optionsBytes =  options;
        pollData.options = new string[](optionsBytes.length);
        for (uint256 i = 0; i < optionsBytes.length; ++i) {
            pollData.options[i] = bytes32ToString(optionsBytes[i]);
        }
        pollData.name = name;
        pollData.totalVotesAmount = totalVotesAmount;
        pollData.startTimestamp = startTimestamp;
        pollData.endTimestamp = endTimestamp;
    }

    /**
     * @notice Returns the options.
     * @return _options The Options.
     */
    function getOptions() external view returns (OptionData[] memory _options) {
        _options = new OptionData[](options.length);
        for (uint256 i = 0; i < options.length; ++i) {
            _options[i].option = bytes32ToString(options[i]);
            _options[i].voteIndex = i;
        }
    }

    /**
     * @notice Returns the poll state.
     * @return state The Poll state.
     */ 
    function getPollState() external view returns (PollState state) {
        if (block.timestamp <= startTimestamp) {
            state = PollState.Created;
        } else if (block.timestamp >= endTimestamp) {
            state = PollState.Ended;
        } else {
            state = PollState.Ongoing;
        }
    }

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
    ) external nonReentrant {
        if (block.timestamp <= startTimestamp) {
            revert PollHasNotStartedYet();
        }
        if (block.timestamp >= endTimestamp) {
            revert PollHasEnded();
        }

        if (nullifierHashes[_nullifierHash]) {
            revert YouAreUsingTheSameNillifierTwice();
        }

        (uint256 merkleTreeDepth, uint256 merkleTreeRoot) = garageVoting.getMerkleTreeData(pollID);

        ISemaphoreVerifier verifier = ISemaphoreVerifier(garageVoting.verifier());

        verifier.verifyProof(
            merkleTreeRoot,
            _nullifierHash,
            uint256(_vote),
            pollID,
            _proof,
            merkleTreeDepth
        );

        nullifierHashes[_nullifierHash] = true;

        uint256 voteIndex = totalVotesAmount;
        totalVotesAmount++;
        votes[voteIndex] = _vote;
    }

    /**
     * @notice Converts bytes32 to string.
     * @param source The Bytes32 source.
     * @return result The String result.
     */
    function bytes32ToString(bytes32 source) internal pure returns (string memory) {
        uint256 length;
        for (uint256 i = 0; i < 32; i++) {
            if (source[i] == 0) {
                length = i;
                break;
            }
        }
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = source[i];
        }
        return string(result);
    }

    /**
     * @notice Converts string to bytes32.
     * @param source The String source.
     * @return result The Bytes32 result.
     */
    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }
}
