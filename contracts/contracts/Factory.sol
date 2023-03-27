// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "./Vote.sol";

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract Votes is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private validators;
    EnumerableSet.AddressSet private voteContracts;

    address public voteContractImplementation; 

    error notAuthorized(address _caller);

    function getValidators() external view returns (address[] memory _validators) {
        _validators = new address[](validators.length());
        for (uint256 i = 0; i < validators.length(); ++i) {
            _validators[i] = validators.at(i);
        }
    }

    function isValidator(address _address) external view returns (bool _isValidator) {
        _isValidator = validators.contains(_address);
    }

    function addValidators(address[] calldata _validators) external onlyOwner {
        for (uint256 i = 0; i < _validators.length; ++i) {
            validators.add(_validators[i]);
        }
    }

    function removeValidators(address[] calldata _validators) external onlyOwner {
        for (uint256 i = 0; i < _validators.length; ++i) {
            validators.remove(_validators[i]);
        }
    }

    function setVoteContractImplementation(address _newVoteContractImplementation) external onlyOwner {
        voteContractImplementation = _newVoteContractImplementation;
    }

    function deployVoteContract(
        uint32 _levels,
        IHasher _hasher,
        IVerifier _verifier,
        uint256 _numOptions
    ) external onlyOwner {
        address clone = Clones.clone(voteContractImplementation);
        Vote(clone).initialize(
            _levels,
            _hasher,
            _verifier,
            _numOptions
        );
        voteContracts.add(clone);
    }
}