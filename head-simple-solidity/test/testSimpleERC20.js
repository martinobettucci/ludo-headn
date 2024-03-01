const { expect } = require("chai");

describe("Token contract", function () {
  describe("Deployment", function () {
    it("Deployment should assign the total supply of tokens to the owner", async function () {
      const [owner] = await ethers.getSigners();
  
      const hardhatToken = await ethers.deployContract("SimpleERC20");
  
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Deployment should give the owner role to msg.sender", async function () {
      const [owner] = await ethers.getSigners();
  
      const hardhatToken = await ethers.deployContract("SimpleERC20");
      //get the contract address
      const contractAddress = hardhatToken.address;
      console.log(contractAddress);
      const ownerRole = await hardhatToken.owner();
      expect(ownerRole).to.equal(owner.address);
    });




  });
});