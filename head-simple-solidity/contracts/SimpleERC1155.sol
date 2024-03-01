// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
contract SimpleERC1155 is ERC1155 {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(
        string memory uri
    ) ERC1155(uri) {
    }
}