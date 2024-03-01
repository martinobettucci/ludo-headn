pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleERC20 is ERC20, Ownable {
    constructor() ERC20("MonToken", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mintOwner(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}