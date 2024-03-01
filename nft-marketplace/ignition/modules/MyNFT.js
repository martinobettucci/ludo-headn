const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MyNFT", (m) => {
  const nft = m.contract("MyNFT");
  return { nft };
});

