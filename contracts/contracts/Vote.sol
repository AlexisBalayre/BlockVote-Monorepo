// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./interfaces/IFactory.sol";

contract Vote {
    IFactory public adminContract;
    mapping(uint256 => bytes32) public options;
    mapping(uint256 => uint256) public optionCounter;

    function initialize(
        string[] calldata _options
	) public initializer {
        adminContract = IFactory(msg.sender);
        options = _options;
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

    function storeOptions(
        String calldata _options
    ) {
        options[0] = _options;
    }

    error NotAuthorized(address _caller);
    error InvalidIndex(uint256 _index);

    function registerCommitment(
        uint256 _commitment
    ) external {
        if (!adminContract.isValidator(msg.sender)) revert NotAuthorized(msg.sender);
        // TODO
    }

}
