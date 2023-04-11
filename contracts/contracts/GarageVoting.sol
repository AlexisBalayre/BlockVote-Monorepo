// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./semaphore/interfaces/ISemaphoreVoting.sol";
import "./semaphore/interfaces/ISemaphoreVerifier.sol";
import "./semaphore/base/SemaphoreGroups.sol";

import "./Poll.sol";
import "./interfaces/IGarageVoting.sol";

contract GarageVoting is IGarageVoting, SemaphoreGroups, AccessControl {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private pollContracts;

    ISemaphoreVerifier public verifier;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private merkleTreeDepth;
    address public pollContractImplementation;

    /// @dev Initializes the Semaphore verifier used to verify the user's ZK proofs.
    /// @param _verifier: Semaphore verifier address.
    constructor(ISemaphoreVerifier _verifier) {
        verifier = _verifier;
        merkleTreeDepth = 20;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(ADMIN_ROLE, _msgSender());
        pollContractImplementation = address(new Poll());
    }
    
    function getMerkleTreeData(uint256 _pollID) external view returns (uint256 _merkleTreeDepth, uint256 _merkleTreeRoot) {
        _merkleTreeDepth = getMerkleTreeDepth(_pollID);
        _merkleTreeRoot = getMerkleTreeRoot(_pollID);
    }

    function getPollContract(uint256 _pollID) external view returns (address) {
        return pollContracts.at(_pollID);
    }

    function getPollsAmount() external view returns (uint256) {
        return pollContracts.length();
    }

    function setVoteContractImplementation(
        address _newVoteContractImplementation
    ) external {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }
        pollContractImplementation = _newVoteContractImplementation;
    }

    function setMerkleTreeDepth(uint256 _merkleTreeDepth) external {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }
        merkleTreeDepth = _merkleTreeDepth;
    }

    /// @dev See {ISemaphoreVoting-createPoll}.
    function createPoll(
        string[] calldata _options,
        string calldata _name,
        uint256 _startTimestamp,
        uint256 _endTimestamp
    ) public {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }

        if (_options.length <= 1) {
            revert InvalidOptions();
        }

        if (_startTimestamp >= _endTimestamp) {
            revert InvalidTimestamps();
        }

        uint256 pollId = pollContracts.length() + 1;
        address clone = Clones.clone(pollContractImplementation);
        Poll(clone).initialize(
            _options, 
            _name,
            pollId,
            _startTimestamp, 
            _endTimestamp
        );
        pollContracts.add(clone);

        _createGroup(pollId, merkleTreeDepth);

        emit PollCreated(pollId, _msgSender());
    }

    /// @dev See {ISemaphoreVoting-addVoter}.
    function addVoter(
        uint256 _pollId,
        uint256 _identityCommitment
    ) public {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }

        if (pollContracts.length() < _pollId) {
            revert PollDoesNotExist(_pollId);
        }

        /* Poll poll = Poll(pollContracts.at(_pollId));

        if (poll.getPollState() == IPoll.PollState.Ended) {
            revert PollHasAlreadyBeenStarted();
        } */

        _addMember(_pollId, _identityCommitment);
    }
}
