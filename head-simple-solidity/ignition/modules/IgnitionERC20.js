const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("IgnitionERC20", (m) => {
    const apollo = m.contract("SimpleERC20", ["MyToken", "MTK", "1e21"]);
    return { apollo };
});