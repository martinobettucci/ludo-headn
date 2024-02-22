var QuizContract = artifacts.require("./Quiz.sol");

module.exports = async (deployer) => {
  await deployer.deploy(QuizContract);
  contractInstance = await QuizContract.deployed();
  console.log(contractInstance.address)
};
