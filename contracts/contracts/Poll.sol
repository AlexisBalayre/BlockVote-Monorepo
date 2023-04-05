// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./Semaphore/interfaces/ISemaphoreVerifier.sol";

import "./interfaces/IGarageVoting.sol";
import "./interfaces/IPoll.sol";

contract Poll is Initializable, IPoll, ReentrancyGuard {
    uint256 public pollID;
    IGarageVoting public garageVoting;
    
    bytes32[] private options;
    string public name;
    uint256 public totalVotes;
    uint256 public startTimestamp;
    uint256 public endTimestamp;

    uint256[] private votes;

    mapping(uint256 => bool) public nullifierHashes;

    function initialize(
        string[] calldata _options,
        uint256 _pollID,
        uint256 _startTimestamp,
        uint256 _endTimestamp
	) public initializer {
        garageVoting = IGarageVoting(msg.sender);

        for (uint256 i = 0; i < _options.length; ++i) {
            options.push(stringToBytes32(_options[i]));
        }

        pollID = _pollID;

        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;
	}
    
    function getEncryptedVotes() external view returns (uint256[] memory encryptedVotes) {
        encryptedVotes = new uint256[](votes.length);
        for (uint256 i = 0; i < votes.length; ++i) {
            encryptedVotes[i] = votes[i];
        }
    }

    function getPollData() external view returns (PollData memory pollData) {
        pollData.options = options;
        pollData.name = name;
        pollData.totalVotes = totalVotes;
        pollData.startTimestamp = startTimestamp;
        pollData.endTimestamp = endTimestamp;
    }

    function getOptions() external view returns (OptionData[] memory _options) {
        _options = new OptionData[](options.length);
        for (uint256 i = 0; i < options.length; ++i) {
            _options[i].option = bytes32ToString(options[i]);
            _options[i].voteIndex = i;
        }
    }

    function getPollState() external view returns (PollState state) {
        if (block.timestamp <= startTimestamp) {
            state = PollState.Created;
        } else if (block.timestamp >= endTimestamp) {
            state = PollState.Ended;
        } else {
            state = PollState.Ongoing;
        }
    }

    function castVote(
        uint256 _vote,
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
            _vote,
            pollID,
            _proof,
            merkleTreeDepth
        );

        nullifierHashes[_nullifierHash] = true;

        votes.push(_vote);
        totalVotes++;
    }

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

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }
}
