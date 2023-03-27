// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IFactory {
    function isValidator(address _address) external view returns (bool _isValidator);
}